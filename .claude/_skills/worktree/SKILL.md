---
name: worktree
description: Working in a git worktree in this repository — why every worktree installs its own dependencies, the gitignored files that must be copied in, when `.claude/` changes take effect, and when to remove one. Use when creating, working inside, or removing a worktree, or when running work alongside something already in progress.
---

# Worktrees

Both locations are gitignored, prettierignored and ESLint-ignored, and [`AGENTS.md`](../../../AGENTS.md#worktrees) says which tooling uses each — including the rule against `git stash`, which costs work rather than time. What follows is what it does not say. `.claude/worktrees/` is hardcoded, and is left there because the only way to move it would stop [`.worktreeinclude`](../../../.worktreeinclude) working.

- **Run `yarn install` first.** Each worktree owns its dependencies — nothing is shared from the main checkout — so Husky, `lint-staged`, the `yarn` scripts and both builds have nothing to run against until it does. It costs seconds and the better part of a gigabyte per worktree, and `postinstall` generates `src/styles/mantine-custom-properties.css`, so `yarn css-vars:check` passes without hand-generating it. See D-260814e.
- **`yarn dev` works, and is the reason for the install.** Nothing needs verifying from the main checkout any more. A worktree is also a different project directory, so Next's per-project lock does not stop a dev server here running alongside one in the main checkout.
- **Gitignored files do not come with a worktree**, and `.env.local` holds `IMAGE_HOST_NAME`, so without it `next dev` and `yarn build` both abort on `Invalid input at "images.remotePatterns[0]"` before serving. [`.worktreeinclude`](../../../.worktreeinclude) copies `.env*.local` into every worktree Claude Code creates; a worktree made by hand with `git worktree add` under `.worktrees/` is not covered, so copy the file in yourself.
- **`.claude/` changes take effect at different times, and only one of them waits for a restart.** Permission rules are read per directory at session start, so verify those from a session started after the merge. Hooks apply immediately — D-260814b verified the edited hook refused the very next command. Skills are watched live too, except that a newly created `..` directory is only picked up by a session started after it exists.
- **Remove the worktree once its pull request merges.** Nothing expires them. A worktree also holds a lock on its branch, so `git branch -D` fails until it is gone; `git worktree prune` clears a registration whose directory has already been deleted.
