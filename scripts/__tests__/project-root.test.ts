import path from 'node:path';

import { projectRootFrom } from '../lib/project-root.mjs';

describe('projectRootFrom', () => {
  it("resolves the caller's script directory one level up to the project root", () => {
    expect(projectRootFrom('file:///repo/scripts/some-script.mjs')).toBe(
      path.resolve('/repo')
    );
  });
});
