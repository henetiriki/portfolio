# AGENTS.md

Working conventions for AI coding agents in this repository.

`docs/` is the source of truth for **what the code does and why**; this file covers **how to work here**. Where the two overlap, this file links rather than restates — a second copy drifts.

## Environment

- **Node 24** (`.nvmrc`, `engines.node`) is the machine default. Do **not** prefix commands with `source ~/.nvm/nvm.sh && nvm use 24` — it is unnecessary and it defeats the permission allowlist, because matching runs against the whole command string.
- **Yarn 4** via Corepack. Use `yarn`, never `npm`.
- The shell's **working directory persists between calls**. Do not prefix commands with `cd`.

## Shell hygiene

The permission allowlist in `.claude/settings.json` matches the _entire_ command string, so a chained command can never match a narrow rule.

- **Do not chain independent commands** with `&&` or `;`. Issue them as separate calls — batch independent ones in the same response so they run in parallel at no extra round trip. A `PreToolUse` hook in `.claude/settings.json` rejects any `Bash` command whose text contains `&&` or `;`, so this is enforced rather than trusted — see [D011](docs/decisions.md#d011--enforce-shell-hygiene-with-a-hook-rather-than-a-convention). The test is textual, so a literal `;` inside an argument (`find … -exec … \;`) is refused too; run those by hand.
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

- [`docs/roadmap.md`](docs/roadmap.md) holds **open work only**. When work completes, **move** it to [`docs/project-history.md`](docs/project-history.md) — moved, not copied. A finished item left in the roadmap, or ticked in place, is a defect.
- **Work agreed in conversation but not started still gets written into the roadmap**, in the branch you are already on, even when unrelated to it. "Add it next time" reliably means never.
- Durable rationale goes in [`docs/decisions.md`](docs/decisions.md); current behaviour goes in the relevant topical doc.
- **No long explanatory comments in CSS, CSS Modules or JSX.** Put the reasoning in the relevant doc and leave at most a one-line pointer at the call site. Relocate it — do not delete it.

## Working across branches

Branches run concurrently here, and `main` is the only integration point. Merges are squashed, so a branch lands as a single commit and its own history does not survive: **rebase onto `origin/main`** rather than merging `main` into a branch, and never merge one branch into another.

- **The conflict surface is three documentation files, not the source.** [`roadmap.md`](docs/roadmap.md), [`project-history.md`](docs/project-history.md) and [`decisions.md`](docs/decisions.md) are touched by nearly every change and each is edited at a fixed anchor, so two branches collide there far more often than in `src/`.
- **A clean rebase is not evidence.** Rebasing #164 over #165 produced three silent failures and one honest conflict: Git spliced a new section into the middle of D009, left two `## D010` headings, and re-applied an identical `.gitignore` rule a second time — all without a marker. Read the diff of every documentation file after a rebase; do not trust the exit status.
- **Claim a decision number when the pull request opens**, checked against `main` _and_ every open pull request. Whichever branch merges second renumbers, and must fix the inbound links — the anchor contains the number, so `grep -rn 'D0NN' AGENTS.md docs/` is part of the resolution, not an afterthought.
- **`project-history.md` conflicts resolve mechanically**: keep both entries, newest date first, and for the same date put the later-merged one on top so the file reads in merge order.
- **In `roadmap.md`, removal wins** when one branch completes an item another merely edited. Touch `Last reviewed:` only when you have actually reviewed the whole roadmap — otherwise it is a one-line conflict on every branch.
- **Merge the smaller branch first**, then rebase the other onto it.
- **Re-run [validation](#validating-a-change) after the rebase**, not only before opening the pull request. Nothing enforces checks on `main` yet, so two branches that each pass alone and break together have nothing to catch them.

## Worktrees

Isolation for work that runs alongside something already in progress. They live in `.claude/worktrees/`, which is both gitignored and prettierignored.

- **`node_modules` is symlinked** from the main checkout through `worktree.symlinkDirectories`, so Husky, `lint-staged` and the `yarn` scripts work inside a worktree. It is shared state: if the branch changes `package.json` or `yarn.lock`, run a real install in the worktree instead of relying on the symlink.
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

Changes touching **only** `docs/`, `*.md` or `.claude/` skip the build, via `ignoreCommand` in `vercel.json`. The expected result is a `success` status reading _"Canceled by Ignored Build Step"_ plus a _"Skipped Deployment"_ comment on the pull request — **that is not a failure**, and it is easy to misread that green tick as a completed build. It also keeps the footer's "Updated:" timestamp honest, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time.

## About this file

Next.js 16's `next dev` may append a managed block delimited by `BEGIN:nextjs-agent-rules`. Leave it in place and commit it alongside your work; removing it only re-creates an uncommitted change on the next dev run.
