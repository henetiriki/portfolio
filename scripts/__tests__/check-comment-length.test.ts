import {
  commentBlocks,
  compare,
  countOverLimit,
} from '../check-comment-length.mjs';

const SLASH = { block: true, line: '//' };
const CSS = { block: true, line: null };
const HASH = { block: false, line: '#' };

const sizes = (source: string, syntax: unknown) =>
  commentBlocks(source.split('\n'), syntax).map(
    (block: { line: number; size: number }) => block.size
  );

describe('commentBlocks', () => {
  it('reads consecutive single-line comments as one block', () => {
    expect(sizes('// one\n// two\n// three\nconst a = 1;\n', SLASH)).toEqual([
      3,
    ]);
  });

  it('splits a run on a blank line and on code', () => {
    expect(sizes('// one\n\n// two\nconst a = 1;\n// three\n', SLASH)).toEqual([
      1, 1, 1,
    ]);
  });

  it('counts a CSS block comment through its continuation lines', () => {
    // The bug the first count had: a continuation line opens with neither `//`
    // nor `*`, so matching on those ended the run at the first one.
    const source = ['a {', '  /* one', '     two', '     three */', '}'].join(
      '\n'
    );

    expect(sizes(source, CSS)).toEqual([3]);
  });

  it('charges nothing for delimiters or a bare continuation marker', () => {
    const source = ['/**', ' * one', ' *', ' * two', ' */'].join('\n');

    expect(sizes(source, SLASH)).toEqual([2]);
  });

  it('ignores a marker that does not start its line', () => {
    expect(sizes("const url = 'https://ouwl.house';\n", SLASH)).toEqual([]);
  });

  it('ignores a shebang, and reads the hash comment under it', () => {
    expect(sizes('#!/bin/sh\n# one\n# two\n', HASH)).toEqual([2]);
  });

  it('does not read a slash comment in a hash-only syntax', () => {
    expect(sizes('// one\n// two\n', HASH)).toEqual([]);
  });
});

describe('countOverLimit', () => {
  it('reports a block of five and not one of four', () => {
    const four = '// a\n// b\n// c\n// d\n';
    const five = `${four}// e\n`;

    expect(countOverLimit(four, SLASH)).toEqual([]);
    expect(countOverLimit(five, SLASH)).toEqual([{ line: 1, size: 5 }]);
  });
});

describe('compare', () => {
  it('passes a file at its allowance and fails one above it', () => {
    expect(compare(new Map([['a.ts', 2]]), { 'a.ts': 2 })).toEqual([]);
    expect(compare(new Map([['a.ts', 3]]), { 'a.ts': 2 })).toHaveLength(1);
  });

  it('fails a file that is not on the allowlist at all', () => {
    expect(compare(new Map([['a.ts', 1]]), {})).toHaveLength(1);
  });

  it('fails an allowance the backlog has outgrown, so the list shrinks', () => {
    expect(compare(new Map([['a.ts', 1]]), { 'a.ts': 2 }).at(0)).toContain(
      'lower the entry to 1'
    );
    expect(compare(new Map(), { 'a.ts': 2 }).at(0)).toContain(
      'remove the entry'
    );
  });
});
