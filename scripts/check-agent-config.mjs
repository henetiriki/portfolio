import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const claudeDir = path.join(projectRoot, '.claude');

const SETTINGS = path.join(claudeDir, 'settings.json');
const LOCAL_SETTINGS = path.join(claudeDir, 'settings.local.json');
const LAUNCH = path.join(claudeDir, 'launch.json');
const PLAYWRIGHT_CONFIG = path.join(projectRoot, 'playwright.config.ts');

const SETTINGS_KEYS = ['hooks', 'permissions'];
const PERMISSION_KEYS = ['allow', 'ask', 'deny'];

// Each case is the command a hook would receive and whether it must be
// refused. The pipe case is the documented carve-out — see D-260814b.
const HOOK_CASES = [
  { command: 'git add . && rm -rf x', denied: true },
  { command: 'echo one; echo two', denied: true },
  { command: 'echo one || echo two', denied: true },
  { command: 'git status', denied: false },
  { command: 'grep foo docs/roadmap.md | head', denied: false },
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
// usual cause is a broken `jq` program, and five copies of one compile error
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

  for (const [event, matchers] of Object.entries(settings.hooks)) {
    for (const matcher of matchers) {
      for (const hook of matcher.hooks ?? []) {
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

        if (matcher.matcher !== 'Bash') continue;

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

try {
  execSync('jq --version', { stdio: 'ignore' });
} catch {
  errors.push(
    'jq is not available, so the hook cannot be exercised. The hook itself fails open when jq is missing; this check deliberately does not.'
  );
}

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
