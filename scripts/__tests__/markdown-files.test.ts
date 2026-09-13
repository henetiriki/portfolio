/* eslint-disable security/detect-non-literal-fs-filename -- every path here is built from this file's own `fs.mkdtempSync` result, never external input */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { markdownFilesUnder } from '../lib/markdown-files.mjs';

describe('markdownFilesUnder', () => {
  it('is empty when the directory does not exist', () => {
    expect(markdownFilesUnder('/nonexistent/docs')).toEqual([]);
  });

  it('finds a Markdown file at the top level', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-files-'));

    try {
      fs.writeFileSync(path.join(dir, 'a.md'), '# A\n');
      fs.writeFileSync(path.join(dir, 'not-markdown.txt'), 'ignore me\n');

      expect(markdownFilesUnder(dir)).toEqual([path.join(dir, 'a.md')]);
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });

  it('recurses into subdirectories', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-files-'));

    try {
      fs.mkdirSync(path.join(dir, 'nested', 'deeper'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'top.md'), '# Top\n');
      fs.writeFileSync(path.join(dir, 'nested', 'mid.md'), '# Mid\n');
      fs.writeFileSync(
        path.join(dir, 'nested', 'deeper', 'bottom.md'),
        '# Bottom\n'
      );

      expect(new Set(markdownFilesUnder(dir))).toEqual(
        new Set([
          path.join(dir, 'top.md'),
          path.join(dir, 'nested', 'mid.md'),
          path.join(dir, 'nested', 'deeper', 'bottom.md'),
        ])
      );
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });

  it('matches the .md extension case-insensitively', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-files-'));

    try {
      fs.writeFileSync(path.join(dir, 'shouty.MD'), '# Shouty\n');

      expect(markdownFilesUnder(dir)).toEqual([path.join(dir, 'shouty.MD')]);
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });
});
