import { execFileSync } from 'node:child_process';

// CI's exclusion list, and only CI's — see docs/ci-and-deploys.md#pull-request.
// Deliberately different from the deploy gate's; see #merge--deploy.
const DIRECTORIES = ['docs/', '.claude/'];
const FILES = ['.worktreeinclude'];
const EXTENSIONS = ['.md'];

/**
 * Whether a single changed path is documentation rather than something that
 * could affect lint, types, tests or the build.
 */
export const isDocumentation = filePath =>
  DIRECTORIES.some(directory => filePath.startsWith(directory)) ||
  FILES.includes(filePath) ||
  EXTENSIONS.some(extension => filePath.endsWith(extension));

/**
 * An empty list is not documentation-only: nothing changed, so the caller
 * should run everything rather than skip on a technicality.
 */
export const isDocumentationOnly = paths =>
  paths.length > 0 && paths.every(isDocumentation);

// Lines are not trimmed: `git status --porcelain` puts the status in the first
// two columns, so ` M package.json` loses its leading space to a trim and then
// its first letter to the slice below.
/* istanbul ignore next -- shells out to git; exercised by running the script, not by importing it under test */
const git = args =>
  execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

/**
 * `--base <ref>` (CI's `HEAD^`) compares only that ref with HEAD. No argument
 * (the local case) also adds uncommitted work — see docs/ci-and-deploys.md#pull-request.
 */
/* istanbul ignore next -- shells out to git; exercised by running the script, not by importing it under test */
const changedPaths = (base, head) => {
  if (base) return git(['diff', '--name-only', base, head]);

  const committed = git(['diff', '--name-only', `origin/main...${head}`]);
  const working = git(['status', '--porcelain']).map(line => {
    // Two status columns then a space. A rename reads `old -> new`; the new
    // path is the one that exists to be checked.
    const [, renamed] = line.slice(3).split(' -> ');

    return renamed ?? line.slice(3);
  });

  return [...new Set([...committed, ...working])];
};

/* istanbul ignore next -- CLI argv parsing; exercised by running the script, not by importing it under test */
const argument = name => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? null : process.argv.at(index + 1);
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  const base = argument('base');
  // `--head` exists so a past commit can be reproduced: `--base <sha>^ --head
  // <sha>` asks what CI asked at the time, where `--base <sha>^` alone would
  // compare it with the current tip and sweep in everything merged since.
  const head = argument('head') ?? 'HEAD';

  let paths;

  try {
    paths = changedPaths(base, head);
  } catch (error) {
    // Fail towards running everything. A classifier that cannot see the diff
    // must not be the reason a check was skipped.
    console.error(
      `Could not classify the change against ${base ?? 'origin/main'}: ${error.message}`
    );
    console.log('docs_only=false');
    process.exit(0);
  }

  const documentationOnly = isDocumentationOnly(paths);

  if (process.argv.includes('--explain')) {
    console.error(
      `Comparing against ${base ?? 'origin/main, plus the working tree'}. ${paths.length} path(s) changed:`
    );
    for (const filePath of paths) {
      console.error(`  ${isDocumentation(filePath) ? ' ' : '*'} ${filePath}`);
    }
    console.error(
      documentationOnly
        ? 'All documentation.'
        : 'Paths marked * are not documentation.'
    );
  }

  console.log(`docs_only=${documentationOnly}`);
};

// Only run as a CLI. Importing it for tests must not execute anything.
/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('classify-change.mjs')) main();
