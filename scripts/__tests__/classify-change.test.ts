import { isDocumentation, isDocumentationOnly } from '../classify-change.mjs';

describe('isDocumentation', () => {
  it.each([
    ['docs/roadmap.md', true],
    ['docs/README.md', true],
    ['AGENTS.md', true],
    ['README.md', true],
    ['.claude/settings.json', true],
    ['.claude/skills/worktree/SKILL.md', true],
    ['.worktreeinclude', true],
    // `:(exclude)*.md` matched at any depth, because git's wildcards cross `/`
    // without `:(glob)` magic. This is the case most easily lost in a rewrite.
    ['.github/pull_request_template.md', true],
    ['src/pages/index.tsx', false],
    ['package.json', false],
    ['.github/workflows/ci.yml', false],
    // Excluded from the Vercel deploy gate but deliberately not from CI: a
    // change to the browser suite is exactly what must run the browser suite.
    ['e2e/routes.spec.ts', false],
    ['playwright.config.ts', false],
    // On neither list, deliberately — it decides what is in the repository at
    // all, and therefore what the build has to work with.
    ['.gitignore', false],
  ])('treats %s as documentation: %s', (filePath, expected) => {
    expect(isDocumentation(filePath)).toBe(expected);
  });
});

describe('isDocumentationOnly', () => {
  it('is true when every path is documentation', () => {
    expect(
      isDocumentationOnly([
        'docs/roadmap.md',
        'AGENTS.md',
        '.claude/skills/worktree/SKILL.md',
      ])
    ).toBe(true);
  });

  it('is false when a single source path is present', () => {
    expect(
      isDocumentationOnly(['docs/roadmap.md', 'src/hooks/useLoading.ts'])
    ).toBe(false);
  });

  it('is false for a browser-suite change, which must run the suite', () => {
    expect(isDocumentationOnly(['e2e/routes.spec.ts'])).toBe(false);
  });

  it('is false for an empty change, rather than skipping on a technicality', () => {
    expect(isDocumentationOnly([])).toBe(false);
  });
});
