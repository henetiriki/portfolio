// The prefixes in AGENTS.md. Conventional Branch minus `hotfix/` and
// `release/`, both of which assume a release process this repository does not
// have, plus `dependabot/`, which is not from Conventional Branch at all.
export const PREFIXES = ['chore', 'dependabot', 'docs', 'feature', 'fix'];

// The four written here, which are the four the description grammar and the
// failure message below both address. Dependabot names its own branches —
// `dependabot/npm_and_yarn/next-16.0.1` — and holding those to that grammar
// would fail every dependency pull request, so its prefix is recognised and
// what follows it is left alone: an owner segment may be mixed case
// (`dependabot/github_actions/JamesIves/…`), which is why this is not `[a-z]`.
const AUTHORED = PREFIXES.filter(prefix => prefix !== 'dependabot');

// eslint-disable-next-line security/detect-non-literal-regexp -- the only interpolation is `AUTHORED`, derived from a module-level literal array of lowercase words; no branch name or other input reaches this
const CONVENTIONAL = new RegExp(
  `^(?:${AUTHORED.join('|')})/[a-z0-9]+(?:-[a-z0-9]+)*$`
);

// An ecosystem segment, then at least one more: `npm_and_yarn/next-16.0.1`.
// Requiring the second slash is what keeps this from accepting `dependabot/`
// plus anything, which would leave the convention advisory for whoever typed
// the prefix by hand. It cannot tell a bot's ref from a hand-made one — no
// branch name can — so this is as narrow as the check gets.
const DEPENDABOT = /^dependabot\/[\w.-]+\/[\w./-]+$/;

/**
 * Whether a branch name follows the convention. Rejects a bare description, an
 * unknown prefix, uppercase, underscores, and a leading, trailing or doubled
 * hyphen in the description. A `dependabot/` branch only has to carry something
 * after the prefix.
 */
export const isConventional = name =>
  CONVENTIONAL.test(name) || DEPENDABOT.test(name);

/**
 * Names the convention does not apply to: the default branch, a detached HEAD,
 * and nothing at all — which is what `github.head_ref` holds on a push.
 */
export const isExempt = name => ['', 'HEAD', 'main'].includes(name);

/* istanbul ignore next -- CLI argv parsing; exercised by running the script, not by importing it under test */
const argument = name => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? null : process.argv.at(index + 1);
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  // CI passes the pull request's head ref explicitly, because the checked-out
  // ref there is the merge commit and carries no branch name at all.
  const name = argument('ref');

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
      `  Expected <prefix>/<hyphenated-description>, lowercase, where <prefix> is one of: ${AUTHORED.join(', ')}.\n` +
      '  The description says what the branch is for, not what it touches — `chore/free-port-3000-and-prefix-branch-names`, not `chore/playwright-config`.\n\n' +
      '  See AGENTS.md#branch-names. Rename the branch and reopen the pull request against the new one.'
  );
  process.exitCode = 1;
};

// Only run as a CLI. Importing it for tests must not read argv or call git.
/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('check-branch-name.mjs')) main();
