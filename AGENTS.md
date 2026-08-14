# AGENTS.md

Working conventions for AI coding agents in this repository.

`docs/` is the source of truth for **what the code does and why**; this file covers **how to work here**. Where the two overlap, this file links rather than restates — a second copy drifts.

## Environment

- **Node 24** (`.nvmrc`, `engines.node`) is the machine default. Do **not** prefix commands with `source ~/.nvm/nvm.sh && nvm use 24` — it is unnecessary and it defeats the permission allowlist, because matching runs against the whole command string.
- **Yarn 4** via Corepack. Use `yarn`, never `npm`.
- The shell's **working directory persists between calls**. Do not prefix commands with `cd`.

## Shell hygiene

The permission allowlist in `.claude/settings.json` matches the _entire_ command string, so a chained command can never match a narrow rule.

- **Do not chain independent commands** with `&&` or `;`. Issue them as separate calls — batch independent ones in the same response so they run in parallel at no extra round trip. A `PreToolUse` hook in `.claude/settings.json` rejects any `Bash` command whose text contains `&&` or `;`, so this is enforced rather than trusted — see [D-260814b](docs/decisions.md#d-260814b--enforce-shell-hygiene-with-a-hook-rather-than-a-convention). The test is textual, so a literal `;` inside an argument (`find … -exec … \;`) is refused too; run those by hand.
- **Do not pass `-C <path>` to `git`.** The working directory is already the repository root, so it buys nothing, and it defeats the allowlist twice over: `Bash(git add *)` matches by prefix and never sees `git -C /path/to/repo add`, while the harness's built-in auto-allow for read-only git reads the token after `git` and finds `-C` rather than `status`. Run `git status`, not `git -C … status`. Widening the rules to cover it is not the fix — `Bash(git -C * )` would allowlist `push --force` and `reset --hard` along with everything else.
- **Prefer `Edit`/`Write` over shell heredocs** for file changes. Piping a `python3` or `node -e` script to rewrite a file is arbitrary code execution, can never be safely allowlisted, and is harder to review.
- Genuine pipelines (`grep … | head`) are one logical command; leave them chained.
- Put section headers in your reply, not in `echo` statements.

## Validating a change

Run these before opening a pull request; the full list, including both builds, is in the [release checklist](docs/release-checklist.md).

```bash
yarn eslint:check
yarn type-check
yarn prettier:check
yarn css-vars:check
yarn test:coverage
yarn test:e2e
```

- `yarn test:e2e` needs a production build first and serves on **port 3000** — the Google Maps API key is restricted to that origin, so another port silently fails Maps authorisation.
- The service worker is a separate TypeScript project: `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json`.
- Saying **"release ready check"** or **"prepare for release"** means running the pre-merge half of the release checklist, including the documentation sweep in both directions.

## Documentation discipline

- **Read the topical doc for the area you are about to change, before changing it.** [`docs/README.md`](docs/README.md) is the index and names what each doc covers. The [release checklist](docs/release-checklist.md#documentation-sweep) already requires updating that doc afterwards, so reading it first is strictly cheaper than discovering late what you contradicted.
  - **Read the one that matters, not all of them.** `docs/` is roughly 250KB across 16 files — `development.md` and `project-history.md` are 46KB and 46KB on their own. Bulk-loading them crowds out the work.
- [`docs/roadmap.md`](docs/roadmap.md) holds **open work only**. When work completes, **move** it to [`docs/project-history.md`](docs/project-history.md) — moved, not copied. A finished item left in the roadmap, or ticked in place, is a defect.
- **Work agreed in conversation but not started still gets written into the roadmap**, in the branch you are already on, even when unrelated to it. "Add it next time" reliably means never.
- Durable rationale goes in [`docs/decisions.md`](docs/decisions.md); current behaviour goes in the relevant topical doc.
- **No long explanatory comments in CSS, CSS Modules or JSX.** Put the reasoning in the relevant doc and leave at most a one-line pointer at the call site. Relocate it — do not delete it.

## Working across branches

Branches run concurrently here, and `main` is the only integration point. Merges are squashed, so a branch lands as a single commit and its own history does not survive: **rebase onto `origin/main`** rather than merging `main` into a branch, and never merge one branch into another.

- **The conflict surface is three documentation files, not the source.** [`roadmap.md`](docs/roadmap.md), [`project-history.md`](docs/project-history.md) and [`decisions.md`](docs/decisions.md) are touched by nearly every change and each is edited at a fixed anchor, so two branches collide there far more often than in `src/`.
- **A clean rebase is not evidence.** Rebasing #164 over #165 produced three silent failures and one honest conflict: Git spliced a new section into the middle of one decision, left two identical decision headings, and re-applied an identical `.gitignore` rule a second time — all without a marker. Read the diff of every documentation file after a rebase; do not trust the exit status.
- **Decision identifiers are dates, so they never collide across branches.** Mint `D-YYMMDD` plus the next free letter for that date — see [Identifiers](docs/decisions.md#identifiers) and [D-260814d](docs/decisions.md#d-260814d--identify-decisions-by-date-rather-than-by-sequence). There is nothing to claim, nothing to check against other pull requests and nothing to renumber, so inbound links cannot break either.
- **`decisions.md` and `project-history.md` conflicts resolve the same way**: keep both entries, newest date first, and for the same date put the later-merged one on top so each file reads in merge order.
- **In `roadmap.md`, removal wins** when one branch completes an item another merely edited. Touch `Last reviewed:` only when you have actually reviewed the whole roadmap — otherwise it is a one-line conflict on every branch.
- **Merge the smaller branch first**, then rebase the other onto it.
- **A change that rewrites one of those three files wholesale needs a window with no other branches open.** Reorganising a doc every branch touches, or moving content between docs, maximises exactly the conflict the rules above exist to contain. Sequence such changes back to back, merging between, and start parallel work only afterwards.
- **Re-run [validation](#validating-a-change) after the rebase**, not only before opening the pull request. Nothing enforces checks on `main` yet, so two branches that each pass alone and break together have nothing to catch them.

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

Changes touching **only** `docs/`, `*.md`, `.claude/` or `.worktreeinclude` skip the build, via `ignoreCommand` in `vercel.json`. The test is the deployed site: a path is excluded because nothing it changes can reach a visitor, so agent and worktree configuration qualifies and `.gitignore` does not. The expected result is a `success` status reading _"Canceled by Ignored Build Step"_ plus a _"Skipped Deployment"_ comment on the pull request — **that is not a failure**, and it is easy to misread that green tick as a completed build. It also keeps the footer's "Updated:" timestamp honest, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time.

## About this file

This is the source of truth for working conventions — edit it here. [`CLAUDE.md`](CLAUDE.md) at the repository root exists only to import this file and [`docs/README.md`](docs/README.md), because Claude Code loads `CLAUDE.md` automatically and would otherwise start with neither. Keep it to those two imports and the note explaining why; conventions that drift into it stop being visible to every other tool that reads `AGENTS.md`.

Next.js 16's `next dev` may append a managed block delimited by `BEGIN:nextjs-agent-rules`. Leave it in place and commit it alongside your work; removing it only re-creates an uncommitted change on the next dev run. It is committed below, from the first `next dev` run inside a worktree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
