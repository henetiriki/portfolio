# AGENTS.md

Working conventions for AI coding agents in this repository.

`docs/` is the source of truth for **what the code does and why**; this file covers **how to work here**. Where the two overlap, this file links rather than restates — a second copy drifts.

## Environment

- **Node 24** (`.nvmrc`, `engines.node`) is the machine default. Do **not** prefix commands with `source ~/.nvm/nvm.sh && nvm use 24` — it is unnecessary and it defeats the permission allowlist, because matching runs against the whole command string.
- **Yarn 4** via Corepack. Use `yarn`, never `npm`.
- The shell's **working directory persists between calls**. Do not prefix commands with `cd`.

## Shell hygiene

The permission allowlist in `.claude/settings.json` matches the _entire_ command string, so a chained command can never match a narrow rule.

- **Do not chain independent commands** with `&&`, `;` or `||`. Issue them as separate calls — batch independent ones in the same response so they run in parallel at no extra round trip. A `PreToolUse` hook in `.claude/settings.json` rejects any `Bash` command whose text contains one of the three, so this is enforced rather than trusted — see [D-260814b](docs/decisions.md#d-260814b--enforce-shell-hygiene-with-a-hook-rather-than-a-convention). The test is textual, so a chain operator inside an argument is refused too — including one sitting in ordinary prose, which is the case that actually recurs. See the bullet below before writing a commit message.
- **Do not pass `-C <path>` to `git`.** The working directory is already the repository root, so it buys nothing, and it defeats the allowlist twice over: `Bash(git add *)` matches by prefix and never sees `git -C /path/to/repo add`, while the harness's built-in auto-allow for read-only git reads the token after `git` and finds `-C` rather than `status`. Run `git status`, not `git -C … status`. Widening the rules to cover it is not the fix — `Bash(git -C * )` would allowlist `push --force` and `reset --hard` along with everything else.
- **Prefer `Edit`/`Write` over shell heredocs** for file changes. Piping a `python3` or `node -e` script to rewrite a file is arbitrary code execution, can never be safely allowlisted, and is harder to review.
- **Write commit messages and pull request bodies to a file, then pass `git commit -F <file>` or `gh pr create --body-file <file>`.** Never an inline heredoc or `--body "…"`. The hook tests the whole command string and a heredoc body is part of it, so any semicolon in the prose refuses the commit — and the messages this project asks for are long enough that one usually appears. This is not the rare `find … -exec … \;` case; it is most commits. `Write` the file to the scratchpad directory first, which also makes the message reviewable before it is committed.
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

**`docs/` is the one prefix that makes a claim the build can check.** Its scope is exactly CI's [cheap path](docs/release-checklist.md#pull-request), so a `docs/` branch should always take that run. Vercel excludes the same paths after a preview branch has built, but its first preview deliberately builds so the pull request has a manual-QA URL. One that triggers `Build & browser suite` is misnamed, or has grown beyond what you meant.

**The other three are categories, not predictions — `chore/` especially.** Vercel's exclusion list is a list of _paths_, not a notion of what is boring: a dependency bump, an `eslint.config.mjs` edit or a workflow change all deploy like anything else, and a `chore/` touching `e2e/` or `playwright.config.ts` does not. Do not read the prefix as a forecast of what CI and Vercel will do; read the [exclusion lists](docs/release-checklist.md#merge--deploy), which differ from each other on purpose.

The description is what the branch is _for_, not what it touches: `chore/free-port-3000-and-prefix-branch-names`, not `chore/playwright-config`.

## Opening a pull request

**Start every pull request body with the human checklist**, before any explanation:

```markdown
### Before merging

- [ ] Nothing changed outside git for this work — ruleset, Codecov, Vercel, repository settings — or if something did, it is recorded in the docs in this PR
- [ ] Manual QA on the **preview URL**, not localhost
```

Two items, deliberately. The long list is the [release checklist](docs/release-checklist.md), and it is worked through before the pull request is opened rather than read at merge time — a checklist nobody reads is worse than none. These two are here because they are the ones an agent **cannot** answer: the first is knowable only by whoever clicked around in a web console, and the second needs eyes on a running site.

The first item exists because that is the gap that actually bit — see the settings bullet under [Documentation discipline](#documentation-discipline).

A `.github/pull_request_template.md` would not help: `gh pr create --body-file` bypasses templates entirely, so the section has to be written into the body. It costs nothing at merge time either, because `squash_merge_commit_message` is `COMMIT_MESSAGES` — the squash commit is built from commit messages, so the checklist never reaches the history.

## Validating a change

Run these before opening a pull request; the full list, including the production build, is in the [release checklist](docs/release-checklist.md).

```bash
yarn eslint:check
yarn type-check
yarn prettier:check
yarn docs:check-links
yarn css-vars:check
yarn test:coverage
yarn test:e2e
```

- `yarn test:e2e` needs a production build first and serves on **port 3001**. **Port 3000 belongs to `next dev`** — leave whatever is running there alone; it is usually a human watching the change land.
- The service worker is a separate TypeScript project: `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json`.
- Saying **"release ready check"** or **"prepare for release"** means running the pre-merge half of the release checklist, including the documentation sweep in both directions.

## Documentation discipline

- **Read the topical doc for the area you are about to change, before changing it.** [`docs/README.md`](docs/README.md) is the index and names what each doc covers. The [release checklist](docs/release-checklist.md#documentation-sweep) already requires updating that doc afterwards, so reading it first is strictly cheaper than discovering late what you contradicted.
  - **Read the one that matters, not all of them.** `docs/` runs to several hundred kilobytes, and `project-history.md` and `development.md` are far larger than the rest. Bulk-loading them crowds out the work.
- [`docs/roadmap.md`](docs/roadmap.md) holds **open work only**. When work completes, **move** it to [`docs/project-history.md`](docs/project-history.md) — moved, not copied. A finished item left in the roadmap, or ticked in place, is a defect.
- **Work agreed in conversation but not started still gets written into the roadmap**, in the branch you are already on, even when unrelated to it. "Add it next time" reliably means never.
- Durable rationale goes in [`docs/decisions.md`](docs/decisions.md); current behaviour goes in the relevant topical doc.
- **Keep the wrong turn when review had to redirect the work.** [`project-history.md`](docs/project-history.md) says it omits superseded investigations, and that means the transcript — not the fact that the first fix was wrong. Where the discarded version is the one that looks obviously right from the presenting symptom, record what it was, why it appealed, and what redirected it. That is the part that stops it being retried; the search that found it is not. [D-260816e](docs/decisions.md#d-260816e--head-the-about-section-with-the-role-not-a-second-copy-of-the-name) is the worked example — the entry first read as though the better structure had been arrived at rather than called in review.
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

- **The conflict surface is three documentation files, not the source.** [`roadmap.md`](docs/roadmap.md), [`project-history.md`](docs/project-history.md) and [`decisions.md`](docs/decisions.md) are touched by nearly every change and each is edited at a fixed anchor, so two branches collide there far more often than in `src/`.
- **A clean rebase is not evidence.** Rebasing #164 over #165 produced three silent failures and one honest conflict: Git spliced a new section into the middle of one decision, left two identical decision headings, and re-applied an identical `.gitignore` rule a second time — all without a marker. Read the diff of every documentation file after a rebase; do not trust the exit status.
- **Decision identifiers are dates, so they never collide across branches.** Mint `D-YYMMDD` plus the next free letter for that date — see [Identifiers](docs/decisions.md#identifiers) and [D-260814d](docs/decisions.md#d-260814d--identify-decisions-by-date-rather-than-by-sequence). There is nothing to claim, nothing to check against other pull requests and nothing to renumber, so inbound links cannot break either.
- **`decisions.md` and `project-history.md` conflicts resolve the same way**: keep both entries, newest date first, and for the same date put the later-merged one on top so each file reads in merge order.
- **In `roadmap.md`, removal wins** when one branch completes an item another merely edited. Touch `Last reviewed:` only when you have actually reviewed the whole roadmap — otherwise it is a one-line conflict on every branch.
- **Merge the smaller branch first**, then rebase the other onto it.
- **A change that rewrites one of those three files wholesale needs a window with no other branches open.** Reorganising a doc every branch touches, or moving content between docs, maximises exactly the conflict the rules above exist to contain. Sequence such changes back to back, merging between, and start parallel work only afterwards.
- **Re-run [validation](#validating-a-change) after the rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so the second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together.

## Worktrees

Isolation for work that runs alongside something already in progress. They live in `.claude/worktrees/`, which is both gitignored and prettierignored.

- **Run `yarn install` first.** Each worktree owns its dependencies — nothing is shared from the main checkout — so Husky, `lint-staged`, the `yarn` scripts and both builds have nothing to run against until it does. It costs about 12 seconds and roughly 950 MB per worktree, and `postinstall` generates `src/styles/mantine-custom-properties.css`, so `yarn css-vars:check` passes without hand-generating it. See [D-260814e](docs/decisions.md#d-260814e--let-each-worktree-install-its-own-dependencies).
- **`yarn dev` works, and is the reason for the install.** Nothing needs verifying from the main checkout any more.
- **Gitignored files do not come with a worktree**, and `.env.local` holds `IMAGE_HOST_NAME`, so without it `next dev` and `yarn build` both abort on `Invalid input at "images.remotePatterns[0]"` before serving. [`.worktreeinclude`](.worktreeinclude) copies `.env*.local` into every worktree Claude Code creates; a worktree made by hand with `git worktree add` is not covered, so copy the file in yourself.
- **Never `git stash`.** The stash stack is shared across worktrees, so a concurrent session can pop your entry. Set work aside with a WIP commit.
- **Changes to `.claude/` do not take effect in the session that makes them** — settings are read per directory at session start. Verify hooks and permission rules after the merge, from a session started in the main checkout.
- **Remove the worktree once its pull request merges.** Nothing expires them. A worktree also holds a lock on its branch, so `git branch -D` fails until it is gone; `git worktree prune` clears a registration whose directory has already been deleted.

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

Next.js 16's `next dev` may append a managed block delimited by `BEGIN:nextjs-agent-rules`. Leave it in place and commit it alongside your work; removing it only re-creates an uncommitted change on the next dev run. It is committed below, from the first `next dev` run inside a worktree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
