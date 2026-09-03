import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Read the extensions ESLint covers from `lint-staged` rather than restating
// them, so the pre-commit hook and this one can never disagree about which
// files are code. The key looks like `**/*.{cjs,js,jsx,mjs,ts,tsx}`.
const eslintExtensions = () => {
  const { 'lint-staged': lintStaged } = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
  );

  const entry = Object.entries(lintStaged ?? {}).find(([, commands]) =>
    [commands].flat().some(command => command.startsWith('eslint'))
  );

  const braces = entry?.at(0).match(/\{([^}]+)\}/);

  return braces ? braces.at(1).split(',') : [];
};

// The payload Claude Code writes to stdin. Absent when run by hand with a path
// argument, which is how this gets tested without going through a hook.
const readPayloadPath = () => {
  try {
    const raw = fs.readFileSync(0, 'utf8');

    return raw.trim() === ''
      ? null
      : (JSON.parse(raw).tool_input?.file_path ?? null);
  } catch {
    return null;
  }
};

const target = readPayloadPath() ?? process.argv.at(2) ?? null;

if (target === null) process.exit(0);

const absolute = path.resolve(projectRoot, target);
const relative = path.relative(projectRoot, absolute);

// Edits outside this repository are routine in an agent session — `AGENTS.md`
// and the Auto mode configuration in the user's home directory, for two — and
// linting them against this project's config would be meaningless.
if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0);

if (!eslintExtensions().includes(path.extname(absolute).slice(1))) {
  process.exit(0);
}

// eslint-disable-next-line security/detect-non-literal-fs-filename -- `absolute` is the path Claude Code reports having just written, resolved inside this repository
if (!fs.existsSync(absolute)) process.exit(0);

try {
  // `--no-warn-ignored` leaves ESLint's own ignore list authoritative and
  // silent, so generated files need no special-casing here.
  execFileSync(
    path.join(projectRoot, 'node_modules/.bin/eslint'),
    ['--fix', '--no-warn-ignored', absolute],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
} catch (error) {
  const report = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();

  // Exit 2 is what puts the report in front of Claude. PostToolUse cannot
  // block — the edit has already happened — so this is advisory, and the point
  // is that it arrives while the work is still in progress.
  console.error(
    `ESLint could not fix everything in ${relative}:\n\n${report}\n\nFix it now rather than leaving it for the pre-commit hook.`
  );
  process.exit(2);
}

process.exit(0);
