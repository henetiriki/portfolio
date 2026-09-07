import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Not an ESLint rule: the backlog spans `src/styles/global.css` and
// `.github/workflows/ci.yml`, and ESLint is configured to see neither, so a
// rule there would hold JavaScript and TypeScript to the limit while the worst
// offenders stayed invisible. See AGENTS.md#documentation-discipline.
export const LIMIT = 4;

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDir, '..');
const allowlistPath = path.join(scriptsDir, 'comment-length-allowlist.json');

// Vendored and tracked, so nobody here can shorten a comment in it. Everything
// else this must not read — generated output, both worktree directories — is
// gitignored, and listing the tree with git rather than a walk is what keeps a
// second copy of that list out of here. As the ESLint and Prettier ignores do.
const VENDORED = '.yarn/';

const LINE = { block: true, line: '//' };
const HASH = { block: false, line: '#' };
const BLOCK = { block: true, line: null };

const SYNTAXES = new Map([
  ['.cjs', LINE],
  ['.css', BLOCK],
  ['.js', LINE],
  ['.jsx', LINE],
  ['.mjs', LINE],
  ['.sh', HASH],
  ['.ts', LINE],
  ['.tsx', LINE],
  ['.yaml', HASH],
  ['.yml', HASH],
]);

const stripLine = (text, marker) => text.slice(marker.length).trim();

const stripBlock = text =>
  text
    .replace(/^\/\*+/, '')
    .replace(/\*\/$/, '')
    .replace(/^\*+/, '')
    .trim();

/**
 * Every comment block in a file, as `{ line, size }`. `size` counts only the
 * lines carrying prose, and consecutive single-line comments are one block
 * rather than one each. A comment must start its own line to be read: a
 * trailing one cannot reach the limit, and a mid-line marker is usually a URL.
 */
export const commentBlocks = (lines, syntax) => {
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const start = index + 1;
    const trimmed = lines.at(index).trim();
    const content = [];

    if (index === 0 && trimmed.startsWith('#!')) {
      index += 1;
      continue;
    }

    if (syntax.line && trimmed.startsWith(syntax.line)) {
      while (index < lines.length) {
        const next = lines.at(index).trim();

        if (!next.startsWith(syntax.line)) break;
        content.push(stripLine(next, syntax.line));
        index += 1;
      }
    } else if (syntax.block && trimmed.startsWith('/*')) {
      let closed = trimmed.slice(2).includes('*/');

      content.push(stripBlock(trimmed));
      index += 1;

      while (!closed && index < lines.length) {
        const next = lines.at(index).trim();

        closed = next.includes('*/');
        content.push(stripBlock(next));
        index += 1;
      }
    } else {
      index += 1;
      continue;
    }

    blocks.push({ line: start, size: content.filter(Boolean).length });
  }

  return blocks;
};

/**
 * How many comment blocks in a file run past the limit. One number per file
 * rather than a line, because the allowlist is checked in and a line anchor
 * would go stale on the first edit above it.
 */
export const countOverLimit = (source, syntax) =>
  commentBlocks(source.split('\n'), syntax).filter(block => block.size > LIMIT);

// `--others --exclude-standard` adds a file written but not yet staged, so a
// comment is reported as it is added rather than one commit later.
const sourceFiles = () =>
  execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard'],
    {
      cwd: projectRoot,
      encoding: 'utf8',
    }
  )
    .split('\n')
    .filter(
      filePath =>
        filePath !== '' &&
        !filePath.startsWith(VENDORED) &&
        SYNTAXES.has(path.extname(filePath))
    );

/**
 * The comparison, as a pure function so the stale-entry case is tested rather
 * than only met on a run where someone happened to fix a comment. An entry that
 * has become too generous fails too: the list only shrinks if a fix that lands
 * under it is reported rather than absorbed.
 */
export const compare = (counts, allowlist) => {
  const errors = [];
  const allowances = new Map(Object.entries(allowlist));

  for (const [filePath, count] of [...counts].sort()) {
    const allowed = allowances.get(filePath) ?? 0;

    if (count > allowed) {
      errors.push(
        `${filePath}: ${count} comment(s) over ${LIMIT} lines, ${allowed} allowed. Each one is a finding on length alone — decide where the argument goes (usually the topical doc, leaving one line and a pointer), rather than assuming it should be deleted.`
      );
    }
  }

  for (const [filePath, allowed] of Object.entries(allowlist).sort()) {
    const count = counts.get(filePath) ?? 0;

    if (count < allowed) {
      errors.push(
        `${filePath}: allowed ${allowed} but found ${count}. Backlog drained — ${count === 0 ? 'remove the entry from' : `lower the entry to ${count} in`} scripts/comment-length-allowlist.json.`
      );
    }
  }

  return errors;
};

const overLimit = () => {
  const found = new Map();

  for (const filePath of sourceFiles()) {
    const syntax = SYNTAXES.get(path.extname(filePath));
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `filePath` is one line of `git ls-files` over this repository's own tree
    const source = fs.readFileSync(path.join(projectRoot, filePath), 'utf8');
    const over = countOverLimit(source, syntax);

    if (over.length > 0) found.set(filePath, over);
  }

  return found;
};

const main = () => {
  const blocks = overLimit();
  const found = new Map([...blocks].map(([file, over]) => [file, over.length]));

  // Where each one is, for whoever drains the backlog: the allowlist counts
  // per file, and a line number in it would go stale on the first edit above.
  if (process.argv.includes('--list')) {
    for (const [filePath, over] of [...blocks].sort()) {
      for (const block of over) {
        console.log(`${filePath}:${block.line}: ${block.size} lines`);
      }
    }

    return;
  }

  if (process.argv.includes('--write-allowlist')) {
    const allowlist = Object.fromEntries([...found].sort());

    fs.writeFileSync(
      allowlistPath,
      `${JSON.stringify(allowlist, null, 2)}\n`,
      'utf8'
    );
    console.log(
      `Wrote ${Object.keys(allowlist).length} file(s) to scripts/comment-length-allowlist.json.`
    );

    return;
  }

  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
  const errors = compare(found, allowlist);

  if (errors.length > 0) {
    console.error(
      `Found ${errors.length} problem(s) with comment length (limit ${LIMIT} lines, see AGENTS.md#documentation-discipline):\n`
    );
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exitCode = 1;

    return;
  }

  console.log(
    `No comment runs past ${LIMIT} lines outside the ${Object.keys(allowlist).length} file(s) still on the allowlist.`
  );
};

// Only run as a CLI. Importing it for tests must not walk the tree.
if (process.argv.at(1)?.endsWith('check-comment-length.mjs')) main();
