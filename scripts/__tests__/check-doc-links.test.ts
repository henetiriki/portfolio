/* eslint-disable security/detect-non-literal-fs-filename -- every path here is built from this file's own `fs.mkdtempSync` result, never external input */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  extractHeadingSlugs,
  findBrokenLinks,
  slugify,
} from '../check-doc-links.mjs';

describe('slugify', () => {
  it.each([
    ['Release Checklist', 'release-checklist'],
    ['What `agent:check-config` proves', 'what-agentcheck-config-proves'],
    // An em dash flanked by two spaces survives as a double hyphen, since the
    // dash itself is stripped rather than replaced and each surrounding space
    // becomes its own hyphen.
    ['Two Words — More Words', 'two-words--more-words'],
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

  // A target outside the files a caller already scanned — a doc under
  // `.github/`, say, once skills or agents come back — has no entry in the
  // pre-built heading map, so this has to fall back to reading it, the same
  // way the pre-refactor version of this script did.
  it('lazily reads headings for a target outside the scanned files', () => {
    const errors = findBrokenLinks(
      [
        {
          lines: ['[jump](../README.md#getting-started)'],
          path: '/repo/docs/a.md',
        },
      ],
      {
        exists: () => true,
        readLines: filePath =>
          filePath === '/repo/README.md' ? ['# Getting Started'] : [],
      }
    );

    expect(errors).toEqual([]);
  });

  it('flags a fragment missing from a lazily read target file', () => {
    const errors = findBrokenLinks(
      [{ lines: ['[jump](../README.md#missing)'], path: '/repo/docs/a.md' }],
      {
        exists: () => true,
        readLines: filePath =>
          filePath === '/repo/README.md' ? ['# Getting Started'] : [],
      }
    );

    expect(errors).toEqual([
      expect.stringContaining(
        'broken anchor "../README.md#missing" — no matching heading in /repo/README.md'
      ),
    ]);
  });

  it('reads a lazily loaded target only once, caching its headings', () => {
    const readLines = jest.fn(() => ['# Getting Started']);
    const errors = findBrokenLinks(
      [
        {
          lines: [
            '[first](../README.md#getting-started)',
            '[second](../README.md#getting-started)',
          ],
          path: '/repo/docs/a.md',
        },
      ],
      { exists: () => true, readLines }
    );

    expect(errors).toEqual([]);
    expect(readLines).toHaveBeenCalledTimes(1);
  });

  it('reads a real file to resolve a fragment when readLines is not provided', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-doc-links-'));

    try {
      fs.writeFileSync(path.join(dir, 'target.md'), '# Real Heading\n');

      const errors = findBrokenLinks([
        {
          lines: ['[jump](target.md#real-heading)'],
          path: path.join(dir, 'a.md'),
        },
      ]);

      expect(errors).toEqual([]);
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
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
