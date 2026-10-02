import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Takes the caller's own `import.meta.url`: every caller lives one level
// below the project root, directly under `scripts/`. Not named `__dirname`
// internally — Jest's CommonJS transform of an ESM file already binds that
// name as a parameter in the enclosing function scope.
export const projectRootFrom = importMetaUrl =>
  path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..');
