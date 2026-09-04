import fs from 'node:fs';

// A heredoc opener, matched against the raw line rather than the blanked one:
// the delimiter is usually quoted (`<<'EOF'`), and blanking would eat it. `<<<`
// is a herestring, not a heredoc, so its body is the same line.
const HEREDOC_START = /<<(?!<)-?\s*(['"]?)([A-Za-z_][\w-]*)\1/;

const CHAIN_OPERATOR = /&&|\|\||;/;

// A `;` that terminates a clause of a compound command is grammar, not a
// separator: `for … ; do … ; done` is one logical command in exactly the sense
// a pipeline is, and it takes the same carve-out. Only the terminator itself is
// blanked, so a body that really does chain — `do echo one; echo two; done` —
// still carries an unblanked `;` and is still refused.
const CLAUSE_TERMINATOR = /;(?=\s*(?:do|done|then|elif|else|fi|esac)\b)/g;

// `;;` ends a `case` arm and is never two separators, since `; ;` is a syntax
// error — so it needs no following keyword to be unambiguous.
const CASE_TERMINATOR = /;;/g;

const CHAIN_REASON =
  'Chained command blocked. Do not join independent commands with &&, ; or ||. Issue them as separate Bash calls, batching independent ones into a single response so they run in parallel. Pipes are allowed.';

const GIT_DASH_C_REASON =
  "`git -C` blocked. The working directory is already the repository root, so `-C` buys nothing — and it defeats the harness's built-in auto-allow for read-only git, which reads the token after `git` and finds `-C` rather than `status`. Run `git status`, not `git -C … status`.";

// Blank a run of characters rather than dropping it, so what remains lines up
// with the original — a quoted argument leaves a gap where a token would be,
// which is what keeps `grep "git -C" AGENTS.md` from reading as two tokens.
const blanks = length => ' '.repeat(length);

/**
 * One line, with its quoted spans blanked. Takes the quote state on entry and
 * returns it on exit, because a quoted string may span lines.
 */
const blankLine = (line, entryQuote) => {
  let quote = entryQuote;
  let blanked = '';

  for (let index = 0; index < line.length; index += 1) {
    const character = line.charAt(index);

    // Literal inside single quotes, an escape everywhere else. `find … -exec …
    // \;` is the case this rescues: the semicolon is escaped, so it is an
    // argument rather than a separator.
    if (quote !== "'" && character === '\\') {
      blanked += blanks(2);
      index += 1;
      continue;
    }

    if (quote === null && (character === "'" || character === '"')) {
      quote = character;
      blanked += blanks(1);
      continue;
    }

    if (quote === character) {
      quote = null;
      blanked += blanks(1);
      continue;
    }

    blanked += quote === null ? character : blanks(1);
  }

  return { blanked, quote };
};

/**
 * The command with every quoted span and heredoc body blanked, leaving only
 * what the shell would read as syntax. Both rules below run against this rather
 * than the raw string, which is the whole of what makes them quote-aware.
 *
 * **It fails open.** An unterminated quote reads as "still inside", so the rest
 * of the command is blanked and nothing is refused. That is the right direction
 * now the hook is a convention rather than a safety control — see D-260904c.
 */
export const codeOnly = command => {
  let quote = null;
  let delimiter = null;

  return command
    .split('\n')
    .map(line => {
      if (delimiter !== null) {
        if (line.trim() === delimiter) delimiter = null;

        return blanks(line.length);
      }

      const result = blankLine(line, quote);
      const opener = HEREDOC_START.exec(line);

      quote = result.quote;
      if (opener) delimiter = opener.at(2);

      return result.blanked;
    })
    .join('\n');
};

/**
 * The same code with every clause terminator blanked, leaving only the `;` that
 * separates one command from the next. Run over `codeOnly`'s output rather than
 * the raw string, so a keyword inside a quoted argument cannot rescue a real
 * separator in front of it.
 */
export const withoutClauseTerminators = code =>
  code
    .replace(CASE_TERMINATOR, blanks(2))
    .replace(CLAUSE_TERMINATOR, blanks(1));

/**
 * The first `&&`, `||` or `;` the shell would treat as a separator, or null.
 */
export const chainOperator = command =>
  withoutClauseTerminators(codeOnly(command)).match(CHAIN_OPERATOR)?.at(0) ??
  null;

/**
 * Whether any `git` invocation passes `-C`. Tokenised rather than matched with
 * one regex, because options may precede it — `git --no-pager -C … status` —
 * and a single pattern for that needs a nested quantifier.
 */
export const usesGitDashC = command => {
  const tokens = codeOnly(command).split(/\s+/).filter(Boolean);

  return tokens.some((token, index) => {
    // eslint-disable-next-line security/detect-possible-timing-attacks -- the rule matches on the name `token`, which here is one word of a shell command, not a credential; there is nothing secret to leak through comparison timing
    if (token !== 'git') return false;

    for (const next of tokens.slice(index + 1)) {
      // The first token that is not an option is the subcommand, and anything
      // after it belongs to the subcommand rather than to git.
      if (!next.startsWith('-')) return false;
      if (next.startsWith('-C')) return true;
    }

    return false;
  });
};

/**
 * The reason to refuse this command, or null to say nothing. Silence is what
 * the harness reads as "no opinion".
 */
export const verdict = command => {
  if (chainOperator(command) !== null) return CHAIN_REASON;
  if (usesGitDashC(command)) return GIT_DASH_C_REASON;

  return null;
};

const main = () => {
  let command = '';

  try {
    command = JSON.parse(fs.readFileSync(0, 'utf8')).tool_input?.command ?? '';
  } catch {
    // No payload, or one that does not parse. Say nothing rather than guess:
    // the harness reads a non-zero exit as a hook error and runs the command
    // anyway, so guessing buys a confusing failure rather than a safer one.
    return;
  }

  const reason = verdict(command);

  if (reason === null) return;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
};

// Only run as a CLI. Importing it for tests must not read stdin.
if (process.argv.at(1)?.endsWith('shell-hygiene.mjs')) main();
