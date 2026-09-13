import { exitCodeFor, selectRefs } from '../should-skip-vercel-build.mjs';

describe('selectRefs', () => {
  it('diffs HEAD^ against HEAD in production, regardless of a previous SHA', () => {
    expect(
      selectRefs({ previousSha: 'abc123', vercelEnv: 'production' })
    ).toEqual(['HEAD^', 'HEAD']);
  });

  it('diffs the previous deployment SHA against HEAD on a preview', () => {
    expect(selectRefs({ previousSha: 'abc123', vercelEnv: 'preview' })).toEqual(
      ['abc123', 'HEAD']
    );
  });

  it('is null with neither a production environment nor a previous SHA', () => {
    expect(
      selectRefs({ previousSha: undefined, vercelEnv: undefined })
    ).toBeNull();
    expect(selectRefs({ previousSha: '', vercelEnv: 'preview' })).toBeNull();
  });
});

describe('exitCodeFor', () => {
  it('passes through a quiet diff and a real difference unchanged', () => {
    expect(exitCodeFor(0)).toBe(0);
    expect(exitCodeFor(1)).toBe(1);
  });

  it('remaps a git failure to build rather than skip', () => {
    expect(exitCodeFor(128)).toBe(1);
  });

  it('remaps a signal-killed process to build rather than skip', () => {
    expect(exitCodeFor(null)).toBe(1);
  });
});
