import {
  extractHeadingSlugs,
  findBrokenLinks,
  slugify,
} from '../check-doc-links.mjs';

describe('slugify', () => {
  it.each([
    ['Release Checklist', 'release-checklist'],
    ['What `agent:check-config` proves', 'what-agentcheck-config-proves'],
    // An em dash flanked by two spaces survives as a double hyphen — this is
    // how every archived "D-YYMMDDx — Title" heading is shaped.
    ['D-260904c — Narrow the hook', 'd-260904c--narrow-the-hook'],
  ])('slugifies %s to %s', (text, expected) => {
    expect(slugify(text)).toBe(expected);
  });
});

describe('extractHeadingSlugs', () => {
  it('collects every heading level', () => {
    expect(extractHeadingSlugs(['# One', '## Two', '###### Six'])).toEqual(
      new Set(['one', 'two', 'six'])
    );
  });

  it('disambiguates a repeated heading the way GitHub does', () => {
    expect(extractHeadingSlugs(['# Notes', '# Notes'])).toEqual(
      new Set(['notes', 'notes-1'])
    );
  });

  it('ignores a heading-shaped line inside a fenced code block', () => {
    expect(extractHeadingSlugs(['```', '# Not a heading', '```'])).toEqual(
      new Set()
    );
  });
});

describe('findBrokenLinks', () => {
  it('is empty when a link resolves and exists returns true', () => {
    const errors = findBrokenLinks(
      [{ lines: ['[link](other.md)'], path: 'docs/a.md' }],
      { exists: () => true }
    );

    expect(errors).toEqual([]);
  });

  it('flags a link whose target does not exist', () => {
    const errors = findBrokenLinks(
      [{ lines: ['[link](missing.md)'], path: 'docs/a.md' }],
      { exists: () => false }
    );

    expect(errors).toEqual([
      expect.stringContaining('broken link "missing.md" — file does not exist'),
    ]);
  });

  it('ignores external links, absolute routes, and empty targets', () => {
    const errors = findBrokenLinks(
      [
        {
          lines: [
            '[external](https://example.com)',
            '[mail](mailto:a@b.com)',
            '[route](/travel)',
            '[protocol-relative](//example.com)',
            '[empty]()',
          ],
          path: 'docs/a.md',
        },
      ],
      { exists: () => false }
    );

    expect(errors).toEqual([]);
  });

  it('flags a same-file anchor with no matching heading', () => {
    const errors = findBrokenLinks([
      { lines: ['# Real Heading', '[jump](#missing)'], path: 'docs/a.md' },
    ]);

    expect(errors).toEqual([
      expect.stringContaining(
        'broken anchor "#missing" — no matching heading in this file'
      ),
    ]);
  });

  it('resolves a same-file anchor against its own headings', () => {
    const errors = findBrokenLinks([
      { lines: ['# Real Heading', '[jump](#real-heading)'], path: 'docs/a.md' },
    ]);

    expect(errors).toEqual([]);
  });

  // `findBrokenLinks` resolves a link target with `path.resolve`, which
  // anchors a relative fixture path against the real working directory rather
  // than the fixture's own tree — so cross-file cases need absolute-looking
  // fixture paths, matching how `main()` always calls this with real absolute
  // paths from disk.
  it('flags a cross-file anchor with no matching heading in the target', () => {
    const errors = findBrokenLinks(
      [
        { lines: ['[jump](b.md#missing)'], path: '/repo/docs/a.md' },
        { lines: ['# Something Else'], path: '/repo/docs/b.md' },
      ],
      { exists: () => true }
    );

    expect(errors).toEqual([
      expect.stringContaining(
        'broken anchor "b.md#missing" — no matching heading in /repo/docs/b.md'
      ),
    ]);
  });

  it('resolves a cross-file anchor against the target file it names', () => {
    const errors = findBrokenLinks(
      [
        { lines: ['[jump](b.md#something-else)'], path: '/repo/docs/a.md' },
        { lines: ['# Something Else'], path: '/repo/docs/b.md' },
      ],
      { exists: () => true }
    );

    expect(errors).toEqual([]);
  });

  it('treats an existing target outside the scanned files as having no headings', () => {
    const errors = findBrokenLinks(
      [{ lines: ['[jump](../README.md#missing)'], path: '/repo/docs/a.md' }],
      { exists: () => true }
    );

    expect(errors).toEqual([
      expect.stringContaining(
        'broken anchor "../README.md#missing" — no matching heading in /repo/README.md'
      ),
    ]);
  });

  it('does not check anchors for a non-Markdown link target', () => {
    const errors = findBrokenLinks(
      [
        {
          lines: ['[source](../scripts/foo.mjs#missing)'],
          path: '/repo/docs/a.md',
        },
      ],
      { exists: () => true }
    );

    expect(errors).toEqual([]);
  });

  it('ignores a link inside a fenced code block', () => {
    const errors = findBrokenLinks(
      [
        {
          lines: ['```', '[not-a-real-link](missing.md)', '```'],
          path: 'docs/a.md',
        },
      ],
      { exists: () => false }
    );

    expect(errors).toEqual([]);
  });

  it('passes each file path through the injected label', () => {
    const errors = findBrokenLinks(
      [{ lines: ['[link](missing.md)'], path: '/repo/docs/a.md' }],
      { exists: () => false, label: filePath => filePath.replace('/repo/', '') }
    );

    expect(errors).toEqual([expect.stringContaining('docs/a.md:1:')]);
  });
});
