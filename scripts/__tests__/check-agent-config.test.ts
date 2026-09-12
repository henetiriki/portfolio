/* eslint-disable security/detect-non-literal-fs-filename -- every path here is built from this file's own `fs.mkdtempSync` result, never external input */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  checkAgents,
  checkHooks,
  checkNoAutoMode,
  checkPermissions,
  checkPorts,
  checkSkills,
  checkSorted,
  frontmatterFields,
  suitePortFrom,
} from '../check-agent-config.mjs';

describe('checkSorted', () => {
  it('is empty for fewer than two values', () => {
    expect(checkSorted('label', ['solo'])).toEqual([]);
  });

  it('is empty when already sorted', () => {
    expect(checkSorted('label', ['a', 'b', 'c'])).toEqual([]);
  });

  it('names the out-of-order value', () => {
    expect(checkSorted('label', ['b', 'a'])).toEqual([
      expect.stringContaining('"b" is out of order'),
    ]);
  });
});

describe('checkPermissions', () => {
  it('is empty when permissions is undefined', () => {
    expect(checkPermissions('.claude/settings.json', undefined)).toEqual([]);
  });

  it('flags an unknown permissions key', () => {
    expect(checkPermissions('.claude/settings.json', { block: [] })).toEqual([
      expect.stringContaining('unknown permissions key "block"'),
    ]);
  });

  it('flags an unsorted list under a known key', () => {
    expect(
      checkPermissions('.claude/settings.json', { deny: ['b', 'a'] })
    ).toEqual([expect.stringContaining('not alphabetically sorted')]);
  });

  it('flags a non-empty allow list, singular for one entry', () => {
    expect(
      checkPermissions('.claude/settings.json', { allow: ['Bash(git *)'] })
    ).toEqual([expect.stringContaining('permissions.allow has 1 entry ')]);
  });

  it('flags a non-empty allow list, plural for more than one entry', () => {
    expect(
      checkPermissions('.claude/settings.json', {
        allow: ['Bash(git *)', 'Bash(yarn *)'],
      })
    ).toEqual([expect.stringContaining('permissions.allow has 2 entries')]);
  });

  it('is empty for a clean permissions block', () => {
    expect(
      checkPermissions('.claude/settings.json', {
        allow: [],
        ask: ['Bash(gh pr merge *)'],
      })
    ).toEqual([]);
  });
});

describe('checkNoAutoMode', () => {
  it('is empty without an autoMode key', () => {
    expect(checkNoAutoMode('.claude/settings.json', {})).toEqual([]);
  });

  it('flags an autoMode key', () => {
    expect(
      checkNoAutoMode('.claude/settings.json', { autoMode: 'default' })
    ).toEqual([expect.stringContaining('has an "autoMode" key')]);
  });
});

describe('checkHooks', () => {
  it('is empty without a hooks key', () => {
    expect(checkHooks({})).toEqual([]);
  });

  it('flags an entry with no hooks array', () => {
    expect(checkHooks({ hooks: { PostToolUse: [{}] } })).toEqual([
      expect.stringContaining('a PostToolUse entry has no "hooks" array'),
    ]);
  });

  it('flags a hook that is not a non-empty command hook', () => {
    expect(
      checkHooks({ hooks: { PostToolUse: [{ hooks: [{ type: 'command' }] }] } })
    ).toEqual([
      expect.stringContaining(
        'PostToolUse hook is not a non-empty command hook'
      ),
    ]);
  });

  it('flags a ${CLAUDE_PROJECT_DIR} reference that does not resolve', () => {
    const errors = checkHooks({
      hooks: {
        PostToolUse: [
          {
            hooks: [
              {
                command:
                  'node "${CLAUDE_PROJECT_DIR}/scripts/does-not-exist.mjs"',
                type: 'command',
              },
            ],
          },
        ],
      },
    });

    expect(errors).toEqual([
      expect.stringContaining(
        'references scripts/does-not-exist.mjs, which does not exist'
      ),
    ]);
  });

  it('is empty when every reference resolves', () => {
    expect(
      checkHooks({
        hooks: {
          PostToolUse: [
            {
              hooks: [
                {
                  command: 'node "${CLAUDE_PROJECT_DIR}/package.json"',
                  type: 'command',
                },
              ],
            },
          ],
        },
      })
    ).toEqual([]);
  });

  it('is empty for a hook command with no ${CLAUDE_PROJECT_DIR} reference at all', () => {
    expect(
      checkHooks({
        hooks: {
          PostToolUse: [
            {
              hooks: [
                {
                  command: 'git add $CLAUDE_FILE_PATHS && yarn lint-staged',
                  type: 'command',
                },
              ],
            },
          ],
        },
      })
    ).toEqual([]);
  });
});

describe('frontmatterFields', () => {
  it('is null without a frontmatter block', () => {
    expect(frontmatterFields('# No frontmatter here\n')).toBeNull();
  });

  it('reads inline fields', () => {
    const fields = frontmatterFields(
      '---\nname: worktree\ndescription: Create a worktree\n---\nBody.\n'
    );

    expect(fields?.get('name')).toBe('worktree');
    expect(fields?.get('description')).toBe('Create a worktree');
  });

  it('joins a block-sequence list back into inline form', () => {
    const fields = frontmatterFields(
      '---\nname: sensitive-information-pass\ndescription: Read the diff\ntools:\n  - Glob\n  - Grep\n  - Read\n---\nBody.\n'
    );

    expect(fields?.get('tools')).toBe('Glob, Grep, Read');
  });

  it('ignores a bullet line outside any block-sequence list', () => {
    const fields = frontmatterFields(
      '---\nname: worktree\n- a stray bullet, not a list item\ndescription: Create a worktree\n---\nBody.\n'
    );

    expect(fields?.get('name')).toBe('worktree');
    expect(fields?.get('description')).toBe('Create a worktree');
  });
});

const withTempDir = (run: (dir: string) => void) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-agent-config-'));

  try {
    run(dir);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
};

describe('checkSkills', () => {
  it('is empty when the skills directory does not exist', () => {
    expect(checkSkills('/nonexistent/.claude/skills')).toEqual([]);
  });

  it('flags a skill directory with no SKILL.md', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));

      expect(checkSkills(dir)).toEqual([
        expect.stringContaining('worktree: has no SKILL.md'),
      ]);
    });
  });

  it('flags a SKILL.md with no YAML frontmatter block', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));
      fs.writeFileSync(
        path.join(dir, 'worktree', 'SKILL.md'),
        '# No frontmatter\n'
      );

      expect(checkSkills(dir)).toEqual([
        expect.stringContaining('has no YAML frontmatter block'),
      ]);
    });
  });

  it('flags a frontmatter name that does not match its directory', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));
      fs.writeFileSync(
        path.join(dir, 'worktree', 'SKILL.md'),
        '---\nname: wrong-name\ndescription: Create a worktree\n---\nBody.\n'
      );

      expect(checkSkills(dir)).toEqual([
        expect.stringContaining(
          'frontmatter name "wrong-name" does not match its directory "worktree"'
        ),
      ]);
    });
  });

  it('flags a missing description', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));
      fs.writeFileSync(
        path.join(dir, 'worktree', 'SKILL.md'),
        '---\nname: worktree\n---\nBody.\n'
      );

      expect(checkSkills(dir)).toEqual([
        expect.stringContaining('has no description'),
      ]);
    });
  });

  it('reports an empty name when the frontmatter has none at all', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));
      fs.writeFileSync(
        path.join(dir, 'worktree', 'SKILL.md'),
        '---\ndescription: Create a worktree\n---\nBody.\n'
      );

      expect(checkSkills(dir)).toEqual([
        expect.stringContaining('frontmatter name "" does not match'),
      ]);
    });
  });

  it('is empty for a well-formed skill', () => {
    withTempDir(dir => {
      fs.mkdirSync(path.join(dir, 'worktree'));
      fs.writeFileSync(
        path.join(dir, 'worktree', 'SKILL.md'),
        '---\nname: worktree\ndescription: Create a worktree\n---\nBody.\n'
      );

      expect(checkSkills(dir)).toEqual([]);
    });
  });
});

describe('checkAgents', () => {
  it('flags no frontmatter block', () => {
    withTempDir(dir => {
      fs.writeFileSync(path.join(dir, 'reviewer.md'), '# No frontmatter\n');

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('has no YAML frontmatter block'),
      ]);
    });
  });

  it('flags a frontmatter name that does not match its filename', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: wrong-name\ndescription: Reads the diff\ntools: Glob, Grep, Read\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining(
          'frontmatter name "wrong-name" does not match its filename "reviewer"'
        ),
      ]);
    });
  });

  it('reports an empty name when the frontmatter has none at all', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\ndescription: Reads the diff\ntools: Glob, Grep, Read\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('frontmatter name "" does not match'),
      ]);
    });
  });

  it('flags an agent with no tools line', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: reviewer\ndescription: Reads the diff\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('declares no tools'),
      ]);
    });
  });

  it('flags a missing description', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: reviewer\ntools: Glob, Grep, Read\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('has no description'),
      ]);
    });
  });

  it('flags unsorted tools', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: reviewer\ndescription: Reads the diff\ntools: Read, Glob\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('not alphabetically sorted'),
      ]);
    });
  });

  it('flags a tool outside the read-only set', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: reviewer\ndescription: Reads the diff\ntools: Edit, Glob\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([
        expect.stringContaining('declares Edit, outside the read-only set'),
      ]);
    });
  });

  it('is empty for a well-formed, read-only agent', () => {
    withTempDir(dir => {
      fs.writeFileSync(
        path.join(dir, 'reviewer.md'),
        '---\nname: reviewer\ndescription: Reads the diff\ntools: Glob, Grep, Read\n---\nBody.\n'
      );

      expect(checkAgents(dir)).toEqual([]);
    });
  });
});

describe('suitePortFrom', () => {
  it('reads the declared port', () => {
    expect(suitePortFrom('const PORT = 3002;\n')).toBe(3002);
  });

  it('is null without a matching declaration', () => {
    expect(suitePortFrom('export const port = 3002;\n')).toBeNull();
  });
});

describe('checkPorts', () => {
  const source = 'const PORT = 3002;\n';

  it('is empty when the launch config declares no configurations at all', () => {
    expect(checkPorts({}, source)).toEqual([]);
  });

  it('reports when the port cannot be determined', () => {
    expect(
      checkPorts({ configurations: [] }, 'export const port = 1;\n')
    ).toEqual([expect.stringContaining('no `const PORT = <number>;` found')]);
  });

  it('flags a configuration whose port collides', () => {
    expect(
      checkPorts(
        { configurations: [{ name: 'Agent preview', port: 3002 }] },
        source
      )
    ).toEqual([expect.stringContaining('"Agent preview" binds 3002')]);
  });

  it('flags a collision hiding in runtimeArgs', () => {
    expect(
      checkPorts(
        {
          configurations: [
            { name: 'Agent preview', runtimeArgs: ['--port', '3002'] },
          ],
        },
        source
      )
    ).toEqual([expect.stringContaining('"Agent preview" binds 3002')]);
  });

  it('is empty when nothing collides', () => {
    expect(
      checkPorts(
        { configurations: [{ name: 'Agent preview', port: 3001 }] },
        source
      )
    ).toEqual([]);
  });
});
