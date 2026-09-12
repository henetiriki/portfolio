import fs from 'node:fs';
import path from 'node:path';

import { markdownFilesUnder } from './lib/markdown-files.mjs';
import { projectRootFrom } from './lib/project-root.mjs';

const projectRoot = projectRootFrom(import.meta.url);
const docsDir = path.join(projectRoot, 'docs');
const skillsDir = path.join(projectRoot, '.claude', 'skills');
const agentsDir = path.join(projectRoot, '.claude', 'agents');

// Mirrors GitHub's heading slugger closely enough for this project's ASCII
// prose: lowercase, drop anything that isn't a word character/hyphen/space,
// then turn every remaining space into a hyphen one-for-one (not collapsed —
// an em dash flanked by two spaces has to survive as a double hyphen, which
// is how every "D-YYMMDDx — Title" heading in the archived decision log is
// shaped).
export const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/ /g, '-');

const headingPattern = /^#{1,6}\s+(.+?)\s*$/;
const fencePattern = /^```/;
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

export const extractHeadingSlugs = lines => {
  const seen = new Map();
  const slugs = new Set();
  let inFence = false;

  for (const line of lines) {
    if (fencePattern.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(headingPattern);

    if (!match) continue;

    const base = slugify(match[1]);
    const count = seen.get(base) ?? 0;

    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }

  return slugs;
};

// `files` is `{ path, lines }[]`, keyed internally by `path` exactly as given
// — so two files linking to each other must use the same spelling of a
// shared target. `exists` and `label` default to the real filesystem and to
// printing the path unchanged; both are overridable so this stays testable
// with short fixture paths and no real disk access.
export const findBrokenLinks = (
  files,
  { exists = fs.existsSync, label = filePath => filePath } = {}
) => {
  const headingsByFile = new Map(
    files.map(file => [file.path, extractHeadingSlugs(file.lines)])
  );
  const headingsFor = filePath => headingsByFile.get(filePath) ?? new Set();
  const errors = [];

  for (const { lines, path: filePath } of files) {
    let inFence = false;

    lines.forEach((line, index) => {
      if (fencePattern.test(line)) {
        inFence = !inFence;

        return;
      }
      if (inFence) return;

      const lineNumber = index + 1;

      for (const match of line.matchAll(linkPattern)) {
        const target = match[1].trim();

        if (
          target === '' ||
          /^[a-z][a-z0-9+.-]*:/i.test(target) || // any URL scheme (https:, mailto:, ...)
          target.startsWith('//') ||
          target.startsWith('/') // a site route, not a repository path
        ) {
          continue;
        }

        const [rawPath, fragment] = target.split('#');

        if (rawPath === '') {
          if (fragment && !headingsFor(filePath).has(fragment)) {
            errors.push(
              `${label(filePath)}:${lineNumber}: broken anchor "#${fragment}" — no matching heading in this file`
            );
          }
          continue;
        }

        const resolvedPath = path.resolve(path.dirname(filePath), rawPath);

        if (!exists(resolvedPath)) {
          errors.push(
            `${label(filePath)}:${lineNumber}: broken link "${rawPath}" — file does not exist`
          );
          continue;
        }

        if (fragment && resolvedPath.endsWith('.md')) {
          if (!headingsFor(resolvedPath).has(fragment)) {
            errors.push(
              `${label(filePath)}:${lineNumber}: broken anchor "${rawPath}#${fragment}" — no matching heading in ${label(resolvedPath)}`
            );
          }
        }
      }
    });
  }

  return errors;
};

// Skills live three directories down and link back out, so their relative
// paths are the easiest thing in the repository to get wrong — and a skill is
// prose Claude reads, with nothing to compile and nothing else to check it.
/* istanbul ignore next -- real directory discovery; exercised by running the script, not by importing it under test */
const skillFiles = () => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `skillsDir` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
  if (!fs.existsSync(skillsDir)) return [];

  return (
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
    fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(skillsDir, entry.name, 'SKILL.md'))
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- built from a directory listing of this repository's own `.claude/skills/`
      .filter(filePath => fs.existsSync(filePath))
  );
};

/* istanbul ignore next -- only used to label main()'s own output; exercised by running the script, not by importing it under test */
const relative = filePath => path.relative(projectRoot, filePath);
/* istanbul ignore next -- thin fs wrapper; exercised by running the script, not by importing it under test */
const readLines = filePath =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `filePath` only ever comes from `markdownFilePaths`, itself built from `readdirSync` over this repository's own `docs/` and root directories
  fs.readFileSync(filePath, 'utf8').split('\n');

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  const markdownFilePaths = [
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `projectRoot` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
    ...fs
      .readdirSync(projectRoot)
      .filter(name => name.endsWith('.md'))
      .map(name => path.join(projectRoot, name)),
    // Recursive rather than a flat read: the decision log is a directory of
    // files rather than one file, so a flat read would leave every decision
    // silently unchecked instead of reporting it.
    ...markdownFilesUnder(docsDir),
    ...skillFiles(),
    // Agents have the same problem skills do, one directory shallower — see
    // scripts/lib/markdown-files.mjs, shared with check-agent-config.mjs.
    ...markdownFilesUnder(agentsDir),
  ].sort();

  const files = markdownFilePaths.map(filePath => ({
    lines: readLines(filePath),
    path: filePath,
  }));

  const errors = findBrokenLinks(files, { label: relative });

  if (errors.length > 0) {
    console.error(`Found ${errors.length} broken documentation link(s):\n`);
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Checked ${markdownFilePaths.length} Markdown files, all internal links resolve.`
    );
  }
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('check-doc-links.mjs')) main();
