import { spawnSync } from 'node:child_process';

// Excluding scripts/ excludes this gate itself, so a change to it no longer
// triggers the deploy that would exercise it. Accepted rather than overlooked:
// D-260904b kept this gate out of the shared classifier because it cannot be
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

// Vercel's convention is inverted from `git diff --quiet`'s: exit 0 skips the
// build, exit 1 builds. `--quiet` already returns 0 for no difference and 1
// for a difference, so only a `git` failure (a `status` above 1, or `null`
// when it was killed by a signal) needs remapping — and it remaps to 1,
// because missing deployment state should build rather than silently skip.
const compareDeploymentChanges = (...refs) => {
  const { status } = spawnSync(
    'git',
    ['diff', '--quiet', ...refs, '--', ...DEPLOYMENT_EXCLUSIONS],
    { stdio: 'inherit' }
  );

  process.exit(status === null || status > 1 ? 1 : status);
};

if (process.env.VERCEL_ENV === 'production') {
  compareDeploymentChanges('HEAD^', 'HEAD');
} else if (process.env.VERCEL_GIT_PREVIOUS_SHA) {
  compareDeploymentChanges(process.env.VERCEL_GIT_PREVIOUS_SHA, 'HEAD');
} else {
  process.exit(1);
}
