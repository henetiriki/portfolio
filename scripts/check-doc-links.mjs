import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const skillsDir = path.join(projectRoot, '.claude', 'skills');
const agentsDir = path.join(projectRoot, '.claude', 'agents');

// Skills live three directories down and link back out, so their relative
// paths are the easiest thing in the repository to get wrong — and a skill is
// prose Claude reads, with nothing to compile and nothing else to check it.
const skillFiles = () => {
  if (!fs.existsSync(skillsDir)) return [];

  return (
    fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(skillsDir, entry.name, 'SKILL.md'))
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- built from a directory listing of this repository's own `.claude/skills/`
      .filter(filePath => fs.existsSync(filePath))
  );
};

// Agents have the same problem one directory shallower, and are flat files
// rather than a directory each — but the walk recurses anyway, because an agent
// filed in a subdirectory would otherwise have its links checked by nothing at
// all, which is the failure this script exists to prevent.
const agentFiles = (directory = agentsDir) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `directory` is `.claude/agents` or a subdirectory of it, reached only by this walk
  if (!fs.existsSync(directory)) return [];

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return agentFiles(entryPath);

    return /\.md$/i.test(entry.name) ? [entryPath] : [];
  });
};

const markdownFiles = [
  ...fs
    .readdirSync(projectRoot)
    .filter(name => name.endsWith('.md'))
    .map(name => path.join(projectRoot, name)),
  ...fs
    .readdirSync(docsDir)
    .filter(name => name.endsWith('.md'))
    .map(name => path.join(docsDir, name)),
  ...skillFiles(),
  ...agentFiles(),
].sort();

const relative = filePath => path.relative(projectRoot, filePath);
const readLines = filePath =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `filePath` only ever comes from `markdownFiles`, itself built from `readdirSync` over this repository's own `docs/` and root directories
  fs.readFileSync(filePath, 'utf8').split('\n');

// Mirrors GitHub's heading slugger closely enough for this project's ASCII
// prose: lowercase, drop anything that isn't a word character/hyphen/space,
// then turn every remaining space into a hyphen one-for-one (not collapsed —
// an em dash flanked by two spaces has to survive as a double hyphen, which
// is how every "D-YYMMDDx — Title" decision anchor in this file is actually
// shaped).
const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/ /g, '-');

const headingPattern = /^#{1,6}\s+(.+?)\s*$/;
const fencePattern = /^```/;
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

const extractHeadingSlugs = lines => {
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

const headingsByFile = new Map(
  markdownFiles.map(filePath => [
    filePath,
    extractHeadingSlugs(readLines(filePath)),
  ])
);

const headingsFor = filePath => {
  if (!headingsByFile.has(filePath)) {
    headingsByFile.set(filePath, extractHeadingSlugs(readLines(filePath)));
  }

  return headingsByFile.get(filePath);
};

const errors = [];

for (const filePath of markdownFiles) {
  const lines = readLines(filePath);
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
            `${relative(filePath)}:${lineNumber}: broken anchor "#${fragment}" — no matching heading in this file`
          );
        }
        continue;
      }

      const resolvedPath = path.resolve(path.dirname(filePath), rawPath);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- `resolvedPath` is a link target parsed from this repository's own committed Markdown, resolved against the linking file's own directory
      if (!fs.existsSync(resolvedPath)) {
        errors.push(
          `${relative(filePath)}:${lineNumber}: broken link "${rawPath}" — file does not exist`
        );
        continue;
      }

      if (fragment && resolvedPath.endsWith('.md')) {
        if (!headingsFor(resolvedPath).has(fragment)) {
          errors.push(
            `${relative(filePath)}:${lineNumber}: broken anchor "${rawPath}#${fragment}" — no matching heading in ${relative(resolvedPath)}`
          );
        }
      }
    }
  });
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} broken documentation link(s):\n`);
  for (const error of errors) {
    console.error(`  ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${markdownFiles.length} Markdown files, all internal links resolve.`
  );
}
