import { execFileSync } from 'node:child_process';

// CI's exclusion list, and only CI's. Vercel's deploy gate keeps its own in
// `should-skip-vercel-build.sh` — it excludes `e2e/` and `playwright.config.ts`
// as well, because it asks whether a visitor could see the change while this
// asks whether lint, types, tests or the build could be affected. The two
// deliberately differ; see docs/release-checklist.md.
//
// These reproduce the git pathspec exclusions this replaced, so the semantics
// have to match exactly: `:(exclude)*.md` matched at any depth, because git's
// wildcards cross `/` without `:(glob)` magic.
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
 * A change is documentation-only when every path in it is documentation. An
 * empty list is not documentation-only: nothing changed, so there is nothing to
 * claim, and the caller should run everything rather than skip on a technicality.
 */
export const isDocumentationOnly = paths =>
  paths.length > 0 && paths.every(isDocumentation);

// Lines are not trimmed: `git status --porcelain` puts the status in the first
// two columns, so ` M package.json` loses its leading space to a trim and then
// its first letter to the slice below.
const git = args =>
  execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

/**
 * The two callers want different things, and conflating them is how a
 * classifier ends up lying about what it looked at:
 *
 * - **`--base <ref>`**, which CI passes as `HEAD^`, compares that ref with HEAD
 *   and nothing else. It is exactly the `HEAD^ HEAD` this replaced, correct
 *   only because merges are squashed so a pull request lands as one commit. The
 *   working tree is deliberately ignored: CI's is clean, and including it would
 *   make the flag useless for asking what a past commit contained.
 * - **No argument**, which is the local case, compares the whole branch against
 *   `origin/main` **and adds uncommitted work**, so it answers correctly whether
 *   or not the change is committed yet. The release sequence commits before
 *   validating, but nothing here depends on that and running mid-edit still
 *   classifies correctly — which is precisely what `HEAD^` cannot do.
 */
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

const argument = name => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? null : process.argv.at(index + 1);
};

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
if (process.argv.at(1)?.endsWith('classify-change.mjs')) main();
