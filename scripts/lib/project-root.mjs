import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Takes the caller's own `import.meta.url` rather than computing its own,
// so the returned path is relative to whichever script called this — every
// caller lives directly under `scripts/`, one level below the project root.
//
// Not named `__dirname` internally: Jest's CommonJS transform of an ESM file
// puts a `const __dirname = …` declaration inside a function scope that
// already binds `__dirname` as a parameter, which is a duplicate declaration
// there even though it's fine under real ESM execution.
export const projectRootFrom = importMetaUrl =>
  path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..');
