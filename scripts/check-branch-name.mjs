import { execFileSync } from 'node:child_process';

// The four prefixes in AGENTS.md, then a lowercase hyphenated description. This
// is Conventional Branch minus `hotfix/` and `release/`, both of which assume a
// release process this repository does not have.
export const PREFIXES = ['chore', 'docs', 'feature', 'fix'];

const CONVENTIONAL = new RegExp(
  `^(?:${PREFIXES.join('|')})/[a-z0-9]+(?:-[a-z0-9]+)*$`
);

/**
 * Whether a branch name follows the convention. Rejects a bare description, an
 * unknown prefix, uppercase, underscores, and a leading, trailing or doubled
 * hyphen in the description.
 */
export const isConventional = name => CONVENTIONAL.test(name);

/**
 * Names the convention does not apply to: the default branch, a detached HEAD,
 * and nothing at all — which is what `github.head_ref` holds on a push.
 */
export const isExempt = name => ['', 'HEAD', 'main'].includes(name);

const currentBranch = () => {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};

const argument = name => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? null : process.argv.at(index + 1);
};

const main = () => {
  // CI passes the pull request's head ref explicitly, because the checked-out
  // ref there is the merge commit and carries no branch name at all.
  const name = argument('ref') ?? currentBranch();

  if (name === null) {
    console.log(
      'No branch to check — git could not resolve one. A branch name is never the reason to block work, so this passes.'
    );

    return;
  }

  if (isExempt(name)) {
    console.log(`Branch "${name}" is exempt from the naming convention.`);

    return;
  }

  if (isConventional(name)) {
    console.log(`Branch "${name}" follows the naming convention.`);

    return;
  }

  console.error(
    `Branch "${name}" does not follow the naming convention.\n\n` +
      `  Expected <prefix>/<hyphenated-description>, lowercase, where <prefix> is one of: ${PREFIXES.join(', ')}.\n` +
      '  The description says what the branch is for, not what it touches — `chore/free-port-3000-and-prefix-branch-names`, not `chore/playwright-config`.\n\n' +
      '  See AGENTS.md#branch-names. Rename the branch and reopen the pull request against the new one.'
  );
  process.exitCode = 1;
};

// Only run as a CLI. Importing it for tests must not read argv or call git.
if (process.argv.at(1)?.endsWith('check-branch-name.mjs')) main();
