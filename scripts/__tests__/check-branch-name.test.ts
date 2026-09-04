import { PREFIXES, isConventional, isExempt } from '../check-branch-name.mjs';

describe('PREFIXES', () => {
  // Conventional Branch minus `hotfix/` and `release/`, both of which assume a
  // release process this repository does not have.
  it('is the four prefixes AGENTS.md names, in alphabetical order', () => {
    expect(PREFIXES).toEqual(['chore', 'docs', 'feature', 'fix']);
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
    ['no-prefix', false],
    ['feature/Bad_Name', false],
    ['Feature/upper-prefix', false],
    // Not one of the four: `hotfix/` and `release/` were left out on purpose.
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
