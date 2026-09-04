import {
  chainOperator,
  codeOnly,
  usesGitDashC,
  verdict,
} from '../shell-hygiene.mjs';

describe('codeOnly', () => {
  it('preserves length, so a quoted argument leaves a gap rather than joining its neighbours', () => {
    const command = 'grep "git -C" AGENTS.md';

    expect(codeOnly(command)).toHaveLength(command.length);
    expect(codeOnly(command)).toBe('grep          AGENTS.md');
  });

  it('leaves an unquoted command untouched', () => {
    expect(codeOnly('git status')).toBe('git status');
  });
});

describe('chainOperator', () => {
  it.each([
    ['git add . && rm -rf x', '&&'],
    ['echo one; echo two', ';'],
    ['echo one || echo two', '||'],
    // A real separator after a quoted span: the blanking must not swallow what
    // follows the closing quote.
    ['echo "one" ; echo "two"', ';'],
  ])('refuses %s', (command, operator) => {
    expect(chainOperator(command)).toBe(operator);
  });

  it.each([
    // A genuine pipeline is one logical command, and always was.
    ['grep foo docs/roadmap.md | head'],
    // The narrowing. Every one of these was refused before the hook became
    // quote-aware, and the first is the case that recurred every session.
    ['git commit -m "Fix the thing; tidy up"'],
    ["git commit -m 'Fix the thing; tidy up'"],
    ["cat <<'EOF' > note.md\nOne thing; then another\nEOF"],
    ['cat <<-EOF > note.md\nOne thing; then another\n\tEOF'],
    // The other casualty D-260814b names: an escaped semicolon is an argument.
    ['find . -name "*.tmp" -exec rm {} \\;'],
  ])('allows %s', command => {
    expect(chainOperator(command)).toBeNull();
  });

  it('fails open on an unterminated quote rather than refusing the rest', () => {
    expect(chainOperator('echo "one ; two')).toBeNull();
  });
});

describe('usesGitDashC', () => {
  it.each([
    ['git -C /somewhere status', true],
    ['git -C/somewhere status', true],
    // Options may precede it, so a single anchored pattern would miss this.
    ['git --no-pager -C /somewhere log', true],
    ['git status', false],
    // Past the subcommand, an argument belongs to the subcommand rather than
    // to git — `-C` is context here, not a repository path.
    ['git log --grep foo -C 3', false],
    // Quoted, so it is prose about the rule rather than a use of it. Worded so
    // `git` and `-C` are separate tokens inside the quotes — in the shorter
    // `grep "git -C"` the opening quote stays welded to `git`, which would pass
    // whether or not the blanking works.
    ['grep -n "use git -C here" AGENTS.md', false],
  ])('reads %s as a `git -C` use: %s', (command, expected) => {
    expect(usesGitDashC(command)).toBe(expected);
  });
});

describe('verdict', () => {
  it('names the chain rule when a command chains', () => {
    expect(verdict('git add . && rm -rf x')).toContain('Chained command');
  });

  it('names the `git -C` rule when a command passes it', () => {
    expect(verdict('git -C /somewhere status')).toContain('`git -C` blocked');
  });

  it('says nothing about a clean command, which the harness reads as no opinion', () => {
    expect(verdict('git status')).toBeNull();
  });
});
