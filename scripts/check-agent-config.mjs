import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { markdownFilesUnder } from './lib/markdown-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const claudeDir = path.join(projectRoot, '.claude');

const SETTINGS = path.join(claudeDir, 'settings.json');
const LOCAL_SETTINGS = path.join(claudeDir, 'settings.local.json');
const LAUNCH = path.join(claudeDir, 'launch.json');
const AGENTS = path.join(claudeDir, 'agents');
const SKILLS = path.join(claudeDir, 'skills');
const PLAYWRIGHT_CONFIG = path.join(projectRoot, 'playwright.config.ts');

const SETTINGS_KEYS = ['hooks', 'permissions'];
const PERMISSION_KEYS = ['allow', 'ask', 'deny'];

// The whole guarantee a subagent offers here is that it cannot act on what it
// finds, so the tool list is the load-bearing part of the file rather than
// configuration around it — see D-260904d.
const READ_ONLY_TOOLS = ['Glob', 'Grep', 'Read'];

// The release-ready check starts a code review by invoking Claude Code's own
// bundled skill. That is one imperative sentence in a Markdown file, with no
// script, hook or command behind it — precisely the instruction whose loss
// nothing else would notice, which per D-260903c makes it something to test
// rather than to trust. Matched by skill name rather than by a literal
// `/code-review` string, because the instruction is deliberately written as an
// imperative: a pasted command string is not documented to reach the Skill
// tool. See D-260904e.
const REVIEW_SKILL = 'code-review';
const RELEASE_READY_SKILL = path.join(
  SKILLS,
  'release-ready-check',
  'SKILL.md'
);

// Each case is the command a hook would receive and whether it must be
// refused. The pipe is the documented carve-out (D-260814b). The last three are
// the narrowing (D-260904c) and matter most: the hook refused all three before
// it became quote-aware, so a rewrite that lost the quote handling would still
// pass every other case here.
const HOOK_CASES = [
  { command: 'git add . && rm -rf x', denied: true },
  { command: 'echo one; echo two', denied: true },
  { command: 'echo one || echo two', denied: true },
  { command: 'git -C /somewhere status', denied: true },
  { command: 'git status', denied: false },
  { command: 'grep foo docs/roadmap.md | head', denied: false },
  { command: 'git commit -m "Fix the thing; tidy up"', denied: false },
  {
    command: "cat <<'EOF' > note.md\nOne thing; then another\nEOF",
    denied: false,
  },
  // Worded so `git` and `-C` are separate tokens inside the quotes: the
  // shorter `grep "git -C"` passes whether or not the blanking works, because
  // the opening quote stays welded to `git`.
  { command: 'grep -n "use git -C here" AGENTS.md', denied: false },
];

const errors = [];
const relative = filePath => path.relative(projectRoot, filePath);

const readJson = filePath => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- every path is a module-level constant naming a file in this repository
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${relative(filePath)}: does not parse — ${error.message}`);

    return null;
  }
};

// eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
const exists = filePath => fs.existsSync(filePath);

const checkSorted = (label, values) => {
  if (!Array.isArray(values) || values.length < 2) return;

  const sorted = [...values].sort();
  const firstOutOfOrder = values.find(
    (value, index) => value !== sorted.at(index)
  );

  if (firstOutOfOrder !== undefined) {
    errors.push(
      `${label}: not alphabetically sorted — "${firstOutOfOrder}" is out of order. AGENTS.md requires hand-maintained lists to be sorted.`
    );
  }
};

const checkPermissions = (filePath, permissions) => {
  if (permissions === undefined) return;

  const label = relative(filePath);

  // Iterated as entries rather than indexed by key, which keeps the sorted
  // check off `security/detect-object-injection` without a disable comment.
  for (const [key, values] of Object.entries(permissions)) {
    if (!PERMISSION_KEYS.includes(key)) {
      errors.push(
        `${label}: unknown permissions key "${key}" — expected one of ${PERMISSION_KEYS.join(', ')}`
      );
    }

    checkSorted(`${label} permissions.${key}`, values);
  }

  if (permissions.allow?.length > 0) {
    errors.push(
      `${label}: permissions.allow has ${permissions.allow.length} entr${permissions.allow.length === 1 ? 'y' : 'ies'} and must stay empty. Allow rules are resolved before the Auto mode classifier, so each one is a bypass — see D-260903b before adding any back, and update this check deliberately if the decision changes.`
    );
  }
};

// `autoMode` is read only from user or managed settings. Claude Code ignores it
// in either project file without complaining, so entries here would sit in a
// reviewed file doing nothing at all.
const checkNoAutoMode = (filePath, settings) => {
  if (settings.autoMode === undefined) return;

  errors.push(
    `${relative(filePath)}: has an "autoMode" key, which Claude Code never reads from a project settings file. It belongs in ~/.claude/settings.json — see D-260903b.`
  );
};

// Returns one trimmed stdout per HOOK_CASES entry, or null if the command
// itself failed. A failing command is reported once rather than per case: the
// usual cause is the hook program throwing, and one copy of that error per case
// buries every other finding. The child's stderr is discarded for the same
// reason — it is already quoted in the message.
const runHook = command => {
  const outputs = [];

  for (const hookCase of HOOK_CASES) {
    const input = JSON.stringify({
      tool_input: { command: hookCase.command },
    });

    try {
      outputs.push(
        // Running the command is the only way to test the hook itself rather
        // than a re-implementation of it. It comes from this repository's own
        // committed, reviewed settings file.
        execSync(command, {
          encoding: 'utf8',
          // Claude Code sets this for every hook it runs. The check has to set
          // it too, or a hook that resolves its script through it exits
          // non-zero here for a reason that has nothing to do with the hook.
          env: { ...process.env, CLAUDE_PROJECT_DIR: projectRoot },
          input,
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim()
      );
    } catch (error) {
      const [firstLine] = `${error.stderr ?? error.message}`.split('\n');

      errors.push(
        `.claude/settings.json: hook command exited non-zero on \`${hookCase.command}\` — ${firstLine}. The hook fails open, so this is silent in normal use — see D-260814b.`
      );

      return null;
    }
  }

  return outputs;
};

const checkHooks = settings => {
  if (settings.hooks === undefined) return;

  for (const [event, entries] of Object.entries(settings.hooks)) {
    for (const entry of entries) {
      // Every event takes { matcher?, hooks: [...] } — `matcher` is optional,
      // `hooks` is not, lifecycle events such as Stop included. Claude Code
      // validates this when it writes the file, but CI has no Claude Code, and
      // the old `entry.hooks ?? []` skipped a malformed entry in silence.
      if (!Array.isArray(entry.hooks)) {
        errors.push(
          `.claude/settings.json: a ${event} entry has no "hooks" array. Hooks are always { matcher?, hooks: [...] }, never a bare command object.`
        );
        continue;
      }

      for (const hook of entry.hooks) {
        if (hook.type !== 'command' || !hook.command) {
          errors.push(
            `.claude/settings.json: ${event} hook is not a non-empty command hook`
          );
          continue;
        }

        const referenced = hook.command.match(
          /\$\{CLAUDE_PROJECT_DIR\}\/([^\s'"]+)/g
        );

        for (const reference of referenced ?? []) {
          const target = path.join(
            projectRoot,
            reference.replace('${CLAUDE_PROJECT_DIR}/', '')
          );

          if (!exists(target)) {
            errors.push(
              `.claude/settings.json: ${event} hook references ${relative(target)}, which does not exist`
            );
          }
        }

        if (entry.matcher !== 'Bash') continue;

        const outputs = runHook(hook.command);

        if (outputs === null) continue;

        HOOK_CASES.forEach((hookCase, index) => {
          const denied = outputs
            .at(index)
            .includes('"permissionDecision":"deny"');

          if (denied !== hookCase.denied) {
            errors.push(
              `.claude/settings.json: ${event} hook ${hookCase.denied ? 'must refuse' : 'must allow'} \`${hookCase.command}\` and did not. The hook fails open, so a broken escape is silent — see D-260814b.`
            );
          }
        });
      }
    }
  }
};

// A skill and a subagent are both prose with a YAML header, so nothing compiles
// either. Returns null when there is no header at all, which is a different
// failure from a header that parses and is missing a field.
//
// A key with no inline value may be followed by a block sequence, which is
// valid YAML and the shape `tools:` is most likely to be written in by hand.
// Those items are joined back into the inline form so a caller reads one shape
// either way — without this, a perfectly restricted agent fails the tools check
// with a message asserting it declared none.
const frontmatterFields = source => {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatter) return null;

  const fields = new Map();
  let listKey = null;

  for (const line of frontmatter.at(1).split('\n')) {
    const field = line.match(/^([a-z-]+):\s*(.*)$/);

    if (field) {
      const value = field.at(2).trim();

      fields.set(field.at(1), value);
      listKey = value === '' ? field.at(1) : null;
      continue;
    }

    const item = line.match(/^\s*-\s+(.*)$/);

    if (!item || listKey === null) continue;

    const collected = fields.get(listKey);

    fields.set(
      listKey,
      collected === ''
        ? item.at(1).trim()
        : `${collected}, ${item.at(1).trim()}`
    );
  }

  return fields;
};

// A skill is prose with a YAML header, so nothing compiles it and nothing else
// checks it. Claude sees only `name` and `description` until it invokes one, so
// a missing description makes the skill unfindable rather than broken — silent
// in exactly the direction that matters.
const checkSkills = () => {
  if (!exists(SKILLS)) return;

  const directories = fs
    .readdirSync(SKILLS, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const directory of directories) {
    const skillPath = path.join(SKILLS, directory.name, 'SKILL.md');
    const label = relative(skillPath);

    if (!exists(skillPath)) {
      errors.push(
        `.claude/skills/${directory.name}: has no SKILL.md, so the directory defines no skill`
      );
      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `skillPath` is built from a directory listing of this repository's own skills
    const fields = frontmatterFields(fs.readFileSync(skillPath, 'utf8'));

    if (!fields) {
      errors.push(`${label}: has no YAML frontmatter block`);
      continue;
    }

    if (fields.get('name') !== directory.name) {
      errors.push(
        `${label}: frontmatter name "${fields.get('name') ?? ''}" does not match its directory "${directory.name}", which is what the slash command uses`
      );
    }

    if (!fields.get('description')) {
      errors.push(
        `${label}: has no description. Claude sees only the name and description until it invokes a skill, so without one it never triggers.`
      );
    }
  }
};

// An agent's `tools` line is the only thing standing between a reviewer that
// reports what it found and one that quietly resolves it, and nothing else in
// this repository would notice the list widening. The two review agents also
// have to be findable: as with a skill, Claude sees only `name` and
// `description` until it dispatches one. The recursive walk itself is shared
// with check-doc-links.mjs — see scripts/lib/markdown-files.mjs.
const checkAgents = () => {
  for (const agentPath of markdownFilesUnder(AGENTS)) {
    const label = relative(agentPath);
    const name = path.basename(agentPath).replace(/\.md$/i, '');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `agentPath` is built from a directory listing of this repository's own agents
    const fields = frontmatterFields(fs.readFileSync(agentPath, 'utf8'));

    if (!fields) {
      errors.push(`${label}: has no YAML frontmatter block`);
      continue;
    }

    if (fields.get('name') !== name) {
      errors.push(
        `${label}: frontmatter name "${fields.get('name') ?? ''}" does not match its filename "${name}", which is what dispatches it`
      );
    }

    if (!fields.get('description')) {
      errors.push(
        `${label}: has no description. Claude sees only the name and description until it dispatches an agent, so without one it never triggers.`
      );
    }

    const tools = (fields.get('tools') ?? '')
      .split(',')
      .map(tool => tool.trim())
      .filter(Boolean);

    if (tools.length === 0) {
      errors.push(
        `${label}: declares no tools, and an agent without a "tools" line inherits every tool the session has — Edit included. See D-260904d.`
      );
      continue;
    }

    checkSorted(`${label} tools`, tools);

    const disallowed = tools.filter(tool => !READ_ONLY_TOOLS.includes(tool));

    if (disallowed.length > 0) {
      errors.push(
        `${label}: declares ${disallowed.join(', ')}, outside the read-only set (${READ_ONLY_TOOLS.join(', ')}). These agents report findings for a person to act on, and one holding a writing tool could resolve what it found instead of reporting it — which is the guarantee, not a detail. See D-260904d, and widen this check deliberately rather than the file.`
      );
    }
  }
};

// Every other check here reads shape — frontmatter fields, sorted lists, a path
// that resolves — or behaviour, by running the hook. This one reads prose, and
// is the only such case; keep it a named function rather than generalising it
// into a table until there is a second.
//
// What it guards is the skill name disappearing from the body, which is what
// deleting or rewriting the section does. It cannot tell an instruction from a
// mention, so a body keeping the name while dropping the imperative still
// passes — the sentence warning against pasting a `/code-review` string would
// be enough on its own. Substring matching is the wrong tool for that, and a
// stricter pattern would break on the rewording this check exists to allow.
const checkReleaseReadyAsksForReview = () => {
  const label = relative(RELEASE_READY_SKILL);

  if (!exists(RELEASE_READY_SKILL)) {
    errors.push(
      `${label}: is missing, so nothing in the pre-pull-request flow asks for a code review — see D-260904e.`
    );

    return;
  }

  // The frontmatter is stripped rather than searched: the description names the
  // review as well, so matching the whole file would let the body lose the
  // instruction while this check still passed.
  const body = fs
    .readFileSync(RELEASE_READY_SKILL, 'utf8')
    .replace(/^---\n[\s\S]*?\n---\n/, '');

  if (!body.toLowerCase().includes(REVIEW_SKILL)) {
    errors.push(
      `${label}: no longer names the "${REVIEW_SKILL}" skill, so a release-ready check would run \`yarn validate\` and never ask for a review. The wording around it is free, but the skill's own hyphenated name has to survive the rewrite — "code review" as prose does not match, deliberately, because naming the skill is what makes the instruction actionable. If the step is genuinely being dropped, change this check deliberately rather than the file. See D-260904e.`
    );
  }
};

const suitePort = () => {
  const source = fs.readFileSync(PLAYWRIGHT_CONFIG, 'utf8');
  const match = source.match(/^const PORT = (\d+);$/m);

  if (!match) {
    errors.push(
      'playwright.config.ts: no `const PORT = <number>;` found, so the port collision check cannot run'
    );

    return null;
  }

  return Number(match[1]);
};

const checkPorts = launch => {
  const port = suitePort();

  if (port === null) return;

  for (const configuration of launch.configurations ?? []) {
    const ports = [
      configuration.port,
      ...(configuration.runtimeArgs ?? []).map(Number),
    ].filter(value => Number.isInteger(value));

    if (ports.includes(port)) {
      errors.push(
        `.claude/launch.json: "${configuration.name}" binds ${port}, the browser suite's port. Playwright never reuses an existing server, so an agent preview left running makes \`yarn test:e2e\` fail on a port conflict — see D-260816g.`
      );
    }
  }
};

const settings = readJson(SETTINGS);

if (settings) {
  for (const key of Object.keys(settings)) {
    if (!SETTINGS_KEYS.includes(key)) {
      errors.push(
        `.claude/settings.json: unknown top-level key "${key}" — expected one of ${SETTINGS_KEYS.join(', ')}`
      );
    }
  }

  checkNoAutoMode(SETTINGS, settings);
  checkPermissions(SETTINGS, settings.permissions);
  checkHooks(settings);
}

// Gitignored, so CI never sees it. Checked when present to give the same signal
// locally, where "Yes, and don't ask again" is what refills it.
if (exists(LOCAL_SETTINGS)) {
  const localSettings = readJson(LOCAL_SETTINGS);

  if (localSettings) {
    checkNoAutoMode(LOCAL_SETTINGS, localSettings);
    checkPermissions(LOCAL_SETTINGS, localSettings.permissions);
  }
}

checkAgents();
checkSkills();
checkReleaseReadyAsksForReview();

const launch = readJson(LAUNCH);

if (launch) {
  checkPorts(launch);
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} agent configuration problem(s):\n`);
  for (const error of errors) {
    console.error(`  ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    'Agent configuration is valid, and the shell-hygiene hook refuses what it claims to.'
  );
}
