import { PREFIXES, isConventional, isExempt } from '../check-branch-name.mjs';

describe('PREFIXES', () => {
  // Conventional Branch minus `hotfix/` and `release/`, both of which assume a
  // release process this repository does not have, plus Dependabot's own.
  it('is the prefixes AGENTS.md names, in alphabetical order', () => {
    expect(PREFIXES).toEqual(['chore', 'dependabot', 'docs', 'feature', 'fix']);
  });
});

describe('isConventional', () => {
  it.each([
    ['feature/react-upgrade', true],
    ['fix/horizontal-scroll-on-travel', true],
    ['docs/record-the-review', true],
    ['chore/free-port-3000-and-prefix-branch-names', true],
    // A single-word description is still a description.
    ['chore/tidy', true],
    ['dependabot/npm_and_yarn/next-16.0.1', true],
    ['dependabot/npm_and_yarn/types/node-24.3.0', true],
    ['dependabot/github_actions/actions/checkout-5', true],
    // An owner segment carries whatever case its owner has.
    ['dependabot/github_actions/JamesIves/github-pages-deploy-action-4', true],
    // The prefix alone still names nothing, and neither does the prefix plus a
    // single segment — a real one always carries an ecosystem and a package.
    ['dependabot/', false],
    ['dependabot', false],
    ['dependabot/typed-by-hand', false],
    ['no-prefix', false],
    ['feature/Bad_Name', false],
    ['Feature/upper-prefix', false],
    // Not one of the prefixes: `hotfix/` and `release/` were left out on purpose.
    ['hotfix/urgent', false],
    ['feature/trailing-', false],
    ['feature/-leading', false],
    ['feature/double--hyphen', false],
    // A prefix with nothing after it names nothing.
    ['feature/', false],
    ['feature', false],
  ])('accepts %s: %s', (name, expected) => {
    expect(isConventional(name)).toBe(expected);
  });
});

describe('isExempt', () => {
  it.each([
    ['main', true],
    // A detached HEAD, which is what a local checkout of a commit reports.
    ['HEAD', true],
    // What `github.head_ref` holds on a push rather than a pull request.
    ['', true],
    ['feature/react-upgrade', false],
    ['no-prefix', false],
  ])('exempts %s: %s', (name, expected) => {
    expect(isExempt(name)).toBe(expected);
  });
});
