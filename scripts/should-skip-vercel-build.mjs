import { spawnSync } from 'node:child_process';

// Excluding scripts/ excludes this gate itself, so a change to it no longer
// triggers the deploy that would exercise it. Accepted rather than overlooked:
// this gate stays out of the shared classifier because it cannot be
// exercised before a real deploy either way.
const DEPLOYMENT_EXCLUSIONS = [
  '.',
  ':(exclude)*.md',
  ':(exclude).claude',
  ':(exclude).env.test',
  ':(exclude).github',
  ':(exclude).husky',
  ':(exclude).prettier*',
  ':(exclude).worktreeinclude',
  ':(exclude)codecov.yml',
  ':(exclude)docs',
  ':(exclude)e2e',
  ':(exclude)eslint.config.mjs',
  ':(exclude)jest.*',
  ':(exclude)playwright*.config.ts',
  ':(exclude)scripts',
];

/**
 * Which two refs to diff, or `null` when neither Vercel environment variable
 * this depends on is set — in which case the caller should build rather than
 * guess. Pure, so the three branches are testable without touching `git`.
 */
export const selectRefs = ({ previousSha, vercelEnv }) => {
  if (vercelEnv === 'production') return ['HEAD^', 'HEAD'];
  if (previousSha) return [previousSha, 'HEAD'];

  return null;
};

// Vercel's convention is inverted from `git diff --quiet`'s: exit 0 skips the
// build, exit 1 builds. `--quiet` already returns 0 for no difference and 1
// for a difference, so only a `git` failure (a `status` above 1, or `null`
// when it was killed by a signal) needs remapping — and it remaps to 1,
// because missing deployment state should build rather than silently skip.
export const exitCodeFor = status =>
  status === null || status > 1 ? 1 : status;

/* istanbul ignore next -- shells out to git; exercised by running the script, not by importing it under test */
const compareDeploymentChanges = (...refs) => {
  const { status } = spawnSync(
    'git',
    ['diff', '--quiet', ...refs, '--', ...DEPLOYMENT_EXCLUSIONS],
    { stdio: 'inherit' }
  );

  process.exit(exitCodeFor(status));
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  const refs = selectRefs({
    previousSha: process.env.VERCEL_GIT_PREVIOUS_SHA,
    vercelEnv: process.env.VERCEL_ENV,
  });

  if (refs === null) {
    process.exit(1);
  } else {
    compareDeploymentChanges(...refs);
  }
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('should-skip-vercel-build.mjs')) main();
