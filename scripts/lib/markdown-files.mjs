import fs from 'node:fs';
import path from 'node:path';

// Shared by check-agent-config.mjs and check-doc-links.mjs. Both need every
// Markdown file under `.claude/agents/`, and check-doc-links.mjs needs the
// same of `docs/`, whose decision log is a directory of one file per decision.
// (`.claude/skills/*/SKILL.md` it locates itself, being one directory
// shallower and one-per-directory rather than free-form.) Recursive, and
// so: a file this walk misses is not reported as a problem, it is silently
// unchecked — an agent tucked in a subdirectory would carry whatever tools it
// liked past a green run, or have its links checked by nothing at all. The
// extension test is case-insensitive for the same reason: checking a file
// that turns out not to be Markdown is loud, and skipping one is not.
const walk = directory =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `directory` is always `.claude/agents` or `docs/`, or a subdirectory of one of them, reached only by this walk
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return walk(entryPath);

    return /\.md$/i.test(entry.name) ? [entryPath] : [];
  });

// Existence is checked once, here, rather than on every recursive call: every
// path `walk` recurses into came from a `readdirSync` entry already known to
// exist, so re-checking it on the way in would just be a wasted syscall per
// level.
export const markdownFilesUnder = directory => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
  if (!fs.existsSync(directory)) return [];

  return walk(directory);
};
