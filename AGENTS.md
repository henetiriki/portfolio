# AGENTS.md

Working conventions for AI coding agents in this repository.

`docs/` is the source of truth for **what the code does and why**; this file covers **how to work here**. Where the two overlap, this file links rather than restates — a second copy drifts.

## Environment

- **Node 24** (`.nvmrc`, `engines.node`) is the machine default. Do **not** prefix commands with `source ~/.nvm/nvm.sh && nvm use 24` — it is unnecessary and it defeats the permission allowlist, because matching runs against the whole command string.
- **Yarn 4** via Corepack. Use `yarn`, never `npm`.
- The shell's **working directory persists between calls**. Do not prefix commands with `cd`.

## Shell hygiene

A chained command is judged as one string, so whatever reviews it — a permission rule, or Auto mode's classifier — returns a single verdict covering every action in it. `git add . && vercel --prod` gets one decision, and the opening is what makes it look routine. Unchaining is what gives each action its own evaluation.

**That file is not the whole permission surface, and most of the rest is not in this repository.** Three things are in play: `.claude/settings.json`, which now holds one `ask` rule and no `allow` rule; a gitignored `.claude/settings.local.json`, also deliberately empty; and Auto mode's own classifier rules, read only from user or managed settings and **never** from either project file, so a checked-in file cannot inject its own. The configuration governing what an agent may do here therefore cannot live here. Both allow lists were emptied on purpose and should stay that way — see [D-260903b](docs/decisions.md#d-260903b--empty-the-local-allowlist-and-let-the-classifier-see-every-command) before adding an entry back.

**A second hook lints what you write.** A `PostToolUse` hook runs `eslint --fix` on each code file as it is edited and reports anything unfixable straight back, so a file being rewritten right after an edit is expected. Fix what it reports rather than leaving it for the commit — see [D-260903d](docs/decisions.md#d-260903d--lint-each-code-file-as-it-is-written-and-let-eslint-interrupt). Both hooks are Node scripts under `scripts/`, referenced through `${CLAUDE_PROJECT_DIR}`, and `yarn agent:check-config` fails if either path stops resolving.

**Permission rules combine rather than override, which is the part that misleads.** The settings precedence order — local above shared above user — decides conflicting _keys_; the rule arrays are not such a key. Every scope's rules are pooled and then evaluated by _type_: `deny` before `ask` before `allow`, wherever each came from. So emptying the local file did not reveal the tracked entries beneath it; both lists were always in force together. Two consequences while working: `.claude/settings.json` also carries an `ask` rule on `gh pr merge`, which prompts even in Auto mode because merging is this project's production deploy; and a change to the out-of-repo half still gets [recorded](#documentation-discipline) in the branch, exactly as a ruleset or Vercel change does.

- **Do not chain independent commands** with `&&`, `;` or `||`. Issue them as separate calls — batch independent ones in the same response so they run in parallel at no extra round trip. A `PreToolUse` hook running [`scripts/shell-hygiene.mjs`](scripts/shell-hygiene.mjs) refuses any `Bash` command that chains, so this is enforced rather than trusted — see [D-260814b](docs/decisions.md#d-260814b--enforce-shell-hygiene-with-a-hook-rather-than-a-convention) for why the rule exists and [D-260904c](docs/decisions.md#d-260904c--narrow-the-shell-hygiene-hook-to-shell-syntax-and-check-branch-names-in-ci) for what it now rests on.
- **An operator inside quotes or a heredoc body is an argument, not a separator, and is allowed.** The hook blanks quoted spans and heredoc bodies before looking, so a semicolon in a commit message or a pull request body no longer refuses the command, and neither does `find … -exec … \;`. It is still not a shell parse: `$(a; b)` outside quotes is refused, and an unterminated quote makes the rest of the command invisible to the check.
- **A compound command is one logical command, like a pipeline.** `for … ; do … ; done`, `while`, `until`, `if … ; then … ; fi` and `case` all need semicolons the shell reads as grammar, and the hook no longer counts those. The carve-out is for the grammar rather than for everything inside it: a body that chains two independent commands, `do echo one; echo two; done`, is still refused, because that is two actions under one verdict.
- **Do not pass `-C <path>` to `git`.** The working directory is already the repository root, so it buys nothing, and it defeats the harness's built-in auto-allow for read-only git, which reads the token after `git` and finds `-C` rather than `status`. Run `git status`, not `git -C … status`. The same hook refuses it.
- **Prefer `Edit`/`Write` over shell heredocs** for file changes. Piping a `python3` or `node -e` script to rewrite a file is arbitrary code execution, can never be safely allowlisted, and is harder to review.
- **Prefer writing commit messages and pull request bodies to a file, then passing `git commit -F <file>` or `gh pr create --body-file <file>`.** `Write` the file to the scratchpad directory first, which makes the message reviewable before it is committed — the same reason `Edit`/`Write` beat a heredoc above. This used to be enforcement rather than advice, because the hook refused any semicolon in the prose; that is fixed at source, so nothing checks this one and an inline `-m` for a short message is not an error.
- **Commits materially prepared by Codex must end with `Co-authored-by: Codex <noreply@openai.com>`.** This trailer is exclusive to Codex: other agents must use their own attribution convention and must not claim Codex co-authorship unless Codex materially contributed. Add the trailer to the message file before committing, separated from the body by a blank line. It applies to new commits and amendments, so the repository history consistently records Codex's contribution across contexts.
- Genuine pipelines (`grep … | head`) are one logical command; leave them chained.
- Put section headers in your reply, not in `echo` statements.

## Branch names

`<prefix>/<hyphenated-description>`, lowercase, always prefixed. Four prefixes:

| Prefix     | For                                                      |
| ---------- | -------------------------------------------------------- |
| `feature/` | New or changed behaviour a visitor could see             |
| `fix/`     | Repairing behaviour that is wrong                        |
| `docs/`    | Only `docs/`, `*.md`, `.claude/` or `.worktreeinclude`   |
| `chore/`   | Tooling, CI, dependencies, tests — work on the machinery |

This is [Conventional Branch](https://conventionalbranch.org/) minus the prefixes this repository has no use for: `hotfix/` and `release/` both assume a release process this repository does not have — every merge deploys straight to production, so an urgent fix is just a `fix/`, and there is nothing to prepare a release on.

**This is checked rather than trusted, and CI is where it binds.** `yarn branch:check` runs [`scripts/check-branch-name.mjs`](scripts/check-branch-name.mjs) against the current branch, and `yarn validate` runs it first. CI runs it again inside `Validate` against the pull request's head ref, which is the enforcement point that holds whoever created the branch — including from an IDE, where no local check ever runs. Renaming a branch after the pull request exists means reopening it, so check before you push. `main` and a detached `HEAD` are exempt. See [D-260904c](docs/decisions.md#d-260904c--narrow-the-shell-hygiene-hook-to-shell-syntax-and-check-branch-names-in-ci).

**`docs/` is the one prefix that makes a claim the build can check.** Its scope is exactly CI's [cheap path](docs/release-checklist.md#pull-request), so a `docs/` branch should always take that run. Vercel excludes the same paths after a preview branch has built, but its first preview deliberately builds so the pull request has a manual-QA URL. One that triggers `Build & browser suite` is misnamed, or has grown beyond what you meant.

**The other three are categories, not predictions — `chore/` especially.** Vercel's exclusion list is a list of _paths_, not a notion of what is boring: a dependency bump, an `eslint.config.mjs` edit or a workflow change all deploy like anything else, and a `chore/` touching `e2e/` or `playwright.config.ts` does not. Do not read the prefix as a forecast of what CI and Vercel will do; read the [exclusion lists](docs/release-checklist.md#merge--deploy), which differ from each other on purpose.

The description is what the branch is _for_, not what it touches: `chore/free-port-3000-and-prefix-branch-names`, not `chore/playwright-config`.

## Opening a pull request

Every pull request body opens with a two-question human checklist, and the body is written to a file rather than passed inline. The procedure is [`.claude/skills/open-pull-request/SKILL.md`](.claude/skills/open-pull-request/SKILL.md) — read it before opening one.

## Validating a change

**The sequence is numbered, and the commits are part of it** — implementation, documentation, the code review's findings, then the two agents', each committed in turn. **The review's findings are committed before the agents are dispatched**, so they read a diff that will not change underneath them. It lives in the [release checklist](docs/release-checklist.md#before-opening-the-pr), which is the one copy; [`.claude/skills/release-ready-check/SKILL.md`](.claude/skills/release-ready-check/SKILL.md) follows it and adds only what is specific to Claude Code, and that skill is also what **"release ready check"** and **"prepare for release"** resolve to. See [D-260905b](docs/decisions.md#d-260905b--number-the-release-ready-sequence-and-commit-before-the-review-runs).

**Two of those checks are judgement rather than commands**, and Claude Code delegates them to read-only reviewers in [`.claude/agents/`](.claude/agents/): the documentation sweep and the sensitive-information pass. Each holds `Glob, Grep, Read` and nothing else, so a finding reaches a person instead of being quietly fixed — see [D-260904d](docs/decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit). A tool without subagents performs both itself; the [release checklist](docs/release-checklist.md) carries the full brief for each and does not depend on the delegation.

**A third check is delegated differently and does not travel.** A code review runs as part of that sequence, invoked from the skill rather than waiting for a person to type `/code-review`, so it happens as part of "run everything" instead of rarely; it reports through `ReportFindings`, which is the only trace it leaves whenever it runs in the main session rather than backgrounding into a subagent — which of the two happens is not predictable. It is Claude Code's own bundled skill rather than an agent built here, and its findings are generic — so it is advisory, and replaces neither of the two above. It is also the one step with no prose brief to fall back on, because a review's criteria belong to the reviewing tool: another tool has no equivalent step here and should say so rather than improvise one. `yarn agent:check-config` asserts the skill body still names the review — a substring test on the skill's own hyphenated name, which catches the section being deleted rather than proving a review runs. See [D-260904e](docs/decisions.md#d-260904e--start-the-code-review-from-the-release-ready-check-and-keep-it-claude-code-only).

**Port 3000 belongs to `next dev`** — leave whatever is running there alone, it is usually a human watching the change land. 3001 is the agent's own preview and 3002 the browser suite; `yarn agent:check-config` fails if those ever collide again.

## Documentation discipline

- **Read the topical doc for the area you are about to change, before changing it.** [`docs/README.md`](docs/README.md) is the index and names what each doc covers. The [release checklist](docs/release-checklist.md#documentation-sweep) already requires updating that doc afterwards, so reading it first is strictly cheaper than discovering late what you contradicted.
  - **Read the one that matters, not all of them.** `docs/` runs to several hundred kilobytes, and `decisions.md` and `development.md` are far larger than the rest. Bulk-loading them crowds out the work.
- [`docs/roadmap.md`](docs/roadmap.md) holds **open work only**. When work completes, **remove** it — the merged pull request is the record of what changed and when, durable rationale goes to [`docs/decisions.md`](docs/decisions.md), and current behaviour goes to the topical doc. A finished item left in the roadmap, or ticked in place, is a defect.
- **Work agreed in conversation but not started still gets written into the roadmap**, in the branch you are already on, even when unrelated to it. "Add it next time" reliably means never.
- Durable rationale goes in [`docs/decisions.md`](docs/decisions.md); current behaviour goes in the relevant topical doc. **Not every reason is durable rationale** — an entry is for a choice that would otherwise be re-litigated, and one that cannot name the alternative it discarded has not earned its place. See [D-260905a](docs/decisions.md#d-260905a--say-what-earns-a-decision-entry-and-do-not-enforce-it-with-a-script).
- **Keep the wrong turn when review had to redirect the work.** What goes is the transcript, not the fact that the first fix was wrong. Where the discarded version is the one that looks obviously right from the presenting symptom, record what it was, why it appealed, and what redirected it. That is the part that stops it being retried; the search that found it is not. It belongs in the decision it qualifies, as the "why not X" half of that rationale — [D-260816e](docs/decisions.md#d-260816e--head-the-about-section-with-the-role-not-a-second-copy-of-the-name) is the worked example, and it first read as though the better structure had been arrived at rather than called in review. Where the note is instead a caveat about what a check cannot see, it belongs in the topical doc beside that check, as the axe/`color-contrast` limitation does in [`development.md`](docs/development.md#browser-regression-suite).
- **A change made outside git is still a change, and it is the one that goes unrecorded.** Repository settings, the `main` ruleset, Codecov, Vercel — none of it produces a commit, so nothing drags the documentation sweep along behind it the way editing a file does. Record it in the branch you are already on, or in a docs-only commit if there is no branch. This is not hypothetical: `codecov/patch` was added to the ruleset while the roadmap still carried adding it as open work, and the next session started from a roadmap that was a step behind the repository. See [D-260816c](docs/decisions.md#d-260816c--keep-the-ruleset-free-of-bypass-actors-and-accept-the-wedge-risk).
- **Before picking up a roadmap item that names a repository setting, verify the live state rather than trusting the item.** `gh api repos/henetiriki/portfolio/rulesets` for branch protection, and `curl -s https://api.codecov.io/api/v2/github/henetiriki/repos/portfolio/` for Codecov activation. Two commands, and they catch the case above before it turns into a pull request that re-does finished work. `gh api repos/henetiriki/portfolio/rulesets/<id>/history` retains every past version with its actor, and is the only record anywhere of a settings change.
- **No long explanatory comments in CSS, CSS Modules or JSX.** Put the reasoning in the relevant doc and leave at most a one-line pointer at the call site. Relocate it — do not delete it.
- **Write documentation prose in UK English.** Keep locale-specific behaviour such as `en-ZA`, external status text, and technical identifiers/API fields (for example `color`) unchanged; translate the surrounding human-language prose instead.
- **Keep drifting numbers out of the prose.** Test totals, file sizes, directory counts and the like are wrong within a few commits and nobody goes back to correct them, so they end up misinforming the reader the doc was written for. Write the property that survives — "the unit suite runs in seconds" rather than a count. Where a figure genuinely carries the argument, date it, as the coverage baseline in [`development.md`](docs/development.md#testing) does.

## Private operational documentation

- Public documentation explains user-facing behaviour and high-level protections. Exact controls, known limitations, monitoring gaps, security decisions, operational commands, and provider-management steps belong in the private maintainer runbook.
- The private runbook is deliberately separate from this repository. An agent may use it only when the maintainer explicitly includes it in the task context; otherwise it must ask for the runbook rather than infer access or recreate private detail from public history.
- Never link to the private runbook, disclose its location, or copy its contents into public files, issues, pull requests, chat summaries, or external tools. Do not put credential values in either repository.

## Working across branches

Branches run concurrently here, and `main` is the only integration point. Merges are squashed, so a branch lands as a single commit and its own history does not survive: **rebase onto `origin/main`** rather than merging `main` into a branch, and never merge one branch into another.

The rest — which two documentation files actually collide and how each resolves, minting a decision identifier, merge order, and why a clean rebase is not evidence — is in [`.claude/skills/work-across-branches/SKILL.md`](.claude/skills/work-across-branches/SKILL.md).

## Worktrees

Isolation for work that runs alongside something already in progress. Two locations, both gitignored, prettierignored and ESLint-ignored: **`.claude/worktrees/`** is where Claude Code creates its own, and **`.worktrees/`** at the repository root is the shared convention for worktrees made by hand or by another agent — see [D-260829a](docs/decisions.md#d-260829a--adopt-a-root-level-worktrees-directory-as-the-shared-convention).

**Never `git stash`.** The stash stack is shared across worktrees, so a concurrent session can pop your entry. Set work aside with a WIP commit.

Everything else — the `yarn install` each worktree needs, the gitignored files that must be copied in, and removal — is in [`.claude/skills/worktree/SKILL.md`](.claude/skills/worktree/SKILL.md).

## Code conventions

- Alphabetical ordering is **lint-enforced**: object keys, destructured keys, JSX props, interface members and imports. Source reads alphabetically rather than by logical grouping.
- Keep hand-maintained lists alphabetical too, even where no linter checks them — `.claude/settings.json`'s `permissions.allow` and the `package.json` scripts are both sorted. Append-at-the-bottom makes them unreviewable.
- `package.json` uses full semantic ranges (`^major.minor.patch`).
- Cross-folder imports use the `@alias/*` paths; `../` is banned by `no-restricted-imports`.

## Deploys

Merging to `main` deploys to production via Vercel. There are no tags or version numbers.

Changes a visitor cannot see skip production builds and subsequent preview builds, via `ignoreCommand` in `vercel.json`; every preview branch's first build is deliberate so its pull request has a QA URL. The excluded paths and reasoning are on the [release checklist](docs/release-checklist.md#merge--deploy). Two consequences matter while working:

- **A skip is a `success` status reading _"Canceled by Ignored Build Step"_, not a failure.** It is easy to misread that green tick as a completed build.
- **CI has its own, shorter list, and the two are not interchangeable.** A change touching only `docs/`, `*.md`, `.claude/` or `.worktreeinclude` gets a [cheap CI path](docs/release-checklist.md#pull-request) — install, `prettier:check`, the Jest run and the coverage upload; the whole `Build & browser suite` job is skipped. `e2e/` and `playwright.config.ts` are excluded from the deploy and deliberately not from CI, because the browser suite is exactly what must run when they change.

## About this file

This is the source of truth for working conventions — edit it here. [`CLAUDE.md`](CLAUDE.md) at the repository root exists only to import this file and [`docs/README.md`](docs/README.md), because Claude Code loads `CLAUDE.md` automatically and would otherwise start with neither. Keep it to those two imports and the note explaining why; conventions that drift into it stop being visible to every other tool that reads `AGENTS.md`.

**What belongs here, and what belongs in a skill.** This file is read in full at the start of every session, so it holds what is true whatever you are doing: the environment, the conventions, the rules about what gets written down. A procedure that applies at one moment — opening a pull request, validating a change, rebasing, working in a worktree — lives in [`.claude/skills/`](.claude/skills/) instead, where Claude Code loads its text only when the task comes up. Each such section keeps its heading here with a line and a link, so an inbound anchor still resolves and any other tool reads the skill as an ordinary Markdown file at the linked path. See [D-260904a](docs/decisions.md#d-260904a--move-the-task-shaped-procedures-into-skills-and-leave-pointers-behind).

Next.js 16's `next dev` may append a managed block delimited by `BEGIN:nextjs-agent-rules`. Leave it in place and commit it alongside your work; removing it only re-creates an uncommitted change on the next dev run. It is committed below, from the first `next dev` run inside a worktree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
