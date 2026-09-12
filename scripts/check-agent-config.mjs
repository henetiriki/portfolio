import fs from 'node:fs';
import path from 'node:path';

import { markdownFilesUnder } from './lib/markdown-files.mjs';
import { projectRootFrom } from './lib/project-root.mjs';

const projectRoot = projectRootFrom(import.meta.url);
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
// configuration around it.
const READ_ONLY_TOOLS = ['Glob', 'Grep', 'Read'];

const relative = filePath => path.relative(projectRoot, filePath);

// eslint-disable-next-line security/detect-non-literal-fs-filename -- every path is a module-level constant naming a file in this repository
const exists = filePath => fs.existsSync(filePath);

/* istanbul ignore next -- thin fs/JSON.parse wrapper; exercised by running the script, not by importing it under test */
const readJson = filePath => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- every path is a module-level constant naming a file in this repository
    return { value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    return {
      error: `${relative(filePath)}: does not parse — ${error.message}`,
    };
  }
};

export const checkSorted = (label, values) => {
  if (!Array.isArray(values) || values.length < 2) return [];

  const sorted = [...values].sort();
  const firstOutOfOrder = values.find(
    (value, index) => value !== sorted.at(index)
  );

  return firstOutOfOrder === undefined
    ? []
    : [
        `${label}: not alphabetically sorted — "${firstOutOfOrder}" is out of order. AGENTS.md requires hand-maintained lists to be sorted.`,
      ];
};

export const checkPermissions = (filePath, permissions) => {
  if (permissions === undefined) return [];

  const label = relative(filePath);
  const errors = [];

  // Iterated as entries rather than indexed by key, which keeps the sorted
  // check off `security/detect-object-injection` without a disable comment.
  for (const [key, values] of Object.entries(permissions)) {
    if (!PERMISSION_KEYS.includes(key)) {
      errors.push(
        `${label}: unknown permissions key "${key}" — expected one of ${PERMISSION_KEYS.join(', ')}`
      );
    }

    errors.push(...checkSorted(`${label} permissions.${key}`, values));
  }

  if (permissions.allow?.length > 0) {
    errors.push(
      `${label}: permissions.allow has ${permissions.allow.length} entr${permissions.allow.length === 1 ? 'y' : 'ies'} and must stay empty. Allow rules are resolved before the Auto mode classifier, so each one is a bypass — update this check deliberately before adding any back.`
    );
  }

  return errors;
};

// `autoMode` is read only from user or managed settings. Claude Code ignores it
// in either project file without complaining, so entries here would sit in a
// reviewed file doing nothing at all.
export const checkNoAutoMode = (filePath, settings) => {
  if (settings.autoMode === undefined) return [];

  return [
    `${relative(filePath)}: has an "autoMode" key, which Claude Code never reads from a project settings file. It belongs in ~/.claude/settings.json.`,
  ];
};

// Shape only: nothing here executes the configured hook against a table of
// commands. That check applies only when a `Bash`-matcher `PreToolUse` hook
// exists to exercise.
export const checkHooks = settings => {
  if (settings.hooks === undefined) return [];

  const errors = [];

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
      }
    }
  }

  return errors;
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
export const frontmatterFields = source => {
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
export const checkSkills = skillsDir => {
  if (!exists(skillsDir)) return [];

  const errors = [];
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `skillsDir` is a parameter so callers can point it at a test fixture; production always calls this with the module-level `SKILLS` constant
  const directories = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const directory of directories) {
    const skillPath = path.join(skillsDir, directory.name, 'SKILL.md');
    const label = relative(skillPath);

    if (!exists(skillPath)) {
      errors.push(
        `${relative(skillsDir)}/${directory.name}: has no SKILL.md, so the directory defines no skill`
      );
      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `skillPath` is built from a directory listing of the skills directory passed in
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

  return errors;
};

// An agent's `tools` line is the only thing standing between a reviewer that
// reports what it found and one that quietly resolves it, and nothing else in
// this repository would notice the list widening. The two review agents also
// have to be findable: as with a skill, Claude sees only `name` and
// `description` until it dispatches one. The recursive walk itself is shared
// with check-doc-links.mjs — see scripts/lib/markdown-files.mjs.
export const checkAgents = agentsDir => {
  const errors = [];

  for (const agentPath of markdownFilesUnder(agentsDir)) {
    const label = relative(agentPath);
    const name = path.basename(agentPath).replace(/\.md$/i, '');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `agentPath` is built from a directory listing of the agents directory passed in
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
        `${label}: declares no tools, and an agent without a "tools" line inherits every tool the session has — Edit included.`
      );
      continue;
    }

    errors.push(...checkSorted(`${label} tools`, tools));

    const disallowed = tools.filter(tool => !READ_ONLY_TOOLS.includes(tool));

    if (disallowed.length > 0) {
      errors.push(
        `${label}: declares ${disallowed.join(', ')}, outside the read-only set (${READ_ONLY_TOOLS.join(', ')}). These agents report findings for a person to act on, and one holding a writing tool could resolve what it found instead of reporting it — which is the guarantee, not a detail. Widen this check deliberately rather than the file.`
      );
    }
  }

  return errors;
};

// Pure: takes the config file's own text rather than reading it, so it can be
// tested against a literal string instead of the real `playwright.config.ts`.
export const suitePortFrom = source => {
  const match = source.match(/^const PORT = (\d+);$/m);

  return match ? Number(match[1]) : null;
};

export const checkPorts = (launch, playwrightConfigSource) => {
  const port = suitePortFrom(playwrightConfigSource);

  if (port === null) {
    return [
      'playwright.config.ts: no `const PORT = <number>;` found, so the port collision check cannot run',
    ];
  }

  const errors = [];

  for (const configuration of launch.configurations ?? []) {
    const ports = [
      configuration.port,
      ...(configuration.runtimeArgs ?? []).map(Number),
    ].filter(value => Number.isInteger(value));

    if (ports.includes(port)) {
      errors.push(
        `.claude/launch.json: "${configuration.name}" binds ${port}, the browser suite's port. Playwright never reuses an existing server, so an agent preview left running makes \`yarn test:e2e\` fail on a port conflict.`
      );
    }
  }

  return errors;
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  const errors = [];
  const settingsResult = readJson(SETTINGS);

  if (settingsResult.error) {
    errors.push(settingsResult.error);
  } else if (settingsResult.value) {
    const settings = settingsResult.value;

    for (const key of Object.keys(settings)) {
      if (!SETTINGS_KEYS.includes(key)) {
        errors.push(
          `.claude/settings.json: unknown top-level key "${key}" — expected one of ${SETTINGS_KEYS.join(', ')}`
        );
      }
    }

    errors.push(...checkNoAutoMode(SETTINGS, settings));
    errors.push(...checkPermissions(SETTINGS, settings.permissions));
    errors.push(...checkHooks(settings));
  }

  // Gitignored, so CI never sees it. Checked when present to give the same
  // signal locally, where "Yes, and don't ask again" is what refills it.
  if (exists(LOCAL_SETTINGS)) {
    const localResult = readJson(LOCAL_SETTINGS);

    if (localResult.error) {
      errors.push(localResult.error);
    } else if (localResult.value) {
      errors.push(...checkNoAutoMode(LOCAL_SETTINGS, localResult.value));
      errors.push(
        ...checkPermissions(LOCAL_SETTINGS, localResult.value.permissions)
      );
    }
  }

  errors.push(...checkAgents(AGENTS));
  errors.push(...checkSkills(SKILLS));

  const launchResult = readJson(LAUNCH);

  if (launchResult.error) {
    errors.push(launchResult.error);
  } else if (launchResult.value) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `PLAYWRIGHT_CONFIG` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
    const playwrightConfigSource = fs.readFileSync(PLAYWRIGHT_CONFIG, 'utf8');

    errors.push(...checkPorts(launchResult.value, playwrightConfigSource));
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} agent configuration problem(s):\n`);
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Agent configuration is valid.');
  }
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('check-agent-config.mjs')) main();
