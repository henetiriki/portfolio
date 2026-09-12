# Claude Code Configuration

What `.claude/` holds, what each part of it is for, and what actually binds it.

**Everything in this directory binds Claude Code and nothing else, which is why this page is named for the tool.** The hooks run inside that harness rather than in git; `launch.json`, `worktrees/` and `.worktreeinclude` are its features. No other tool reads any of it. The cross-tool conventions are in [`AGENTS.md`](../AGENTS.md), and this page is not a second copy of them for a different audience.

**Other files own the flow this directory implements, and none of it is repeated here.** [`AGENTS.md`](../AGENTS.md) holds the conventions in one-line form with pointers; the [release checklist](release-checklist.md#before-opening-the-pr) holds the numbered sequence. This page holds only what none of them can: what each file in the directory is, how it is selected, and what the check over it does and does not prove.

## What the directory holds

| Path                  | What it is                                                     |
| --------------------- | -------------------------------------------------------------- |
| `settings.json`       | The one hook, and one `ask` permission rule                    |
| `settings.local.json` | Gitignored; deliberately empty                                 |
| `launch.json`         | The agent's own dev and production previews, both on port 3001 |
| `worktrees/`          | Gitignored; where Claude Code creates its worktrees            |

`.worktreeinclude` is part of the same surface but sits at the repository root, because it configures a Claude Code feature rather than living inside its directory.

## The code review is not in this directory

It is Claude Code's own bundled `code-review` skill, asked for rather than invoked, and nothing here dispatches it. How it is handed over is on the [release checklist](release-checklist.md#code-review).

## Hooks

The one hook is configured in `settings.json` and documented in [Git hooks](development.md#git-hooks), a section that disclaims its own heading a few paragraphs in. It stays there rather than moving here because that section is where its `git add`/`yarn lint-staged` command is explained alongside the `lint-staged` block it runs, so the paragraph is only legible beside it — proximity, not a copy that moving would duplicate. A second, `PreToolUse` hook enforcing the shell-hygiene conventions in [`AGENTS.md`](../AGENTS.md#shell-hygiene) previously sat here too, and comes back only if one is reintroduced.

## What `agent:check-config` proves

`yarn agent:check-config` runs [`scripts/check-agent-config.mjs`](../scripts/check-agent-config.mjs), and is one of the steps CI [never gates](release-checklist.md#pull-request). The consequence for this directory: on a change that touches only `.claude/`, it is the only step in CI that reads the configuration at all.

It is shape, by reading, rather than behaviour, by execution — nothing here runs the configured hook against a table of commands, which is what the check did while a `PreToolUse` hook existed to exercise. `settings.json` parses and carries no key beyond `hooks` and `permissions`; no `autoMode` key in either settings file; permission lists sorted and `allow` empty; hook entries well-formed and every `${CLAUDE_PROJECT_DIR}` path resolving; and no launch configuration binding the browser suite's port.

**`settings.local.json` is gitignored, so CI never sees it; it is checked only when it happens to be present locally.**

## The permission surface is mostly not in this repository

A reader looking here for the configuration that governs what an agent may do will not find it: both project settings files are deliberately near-empty, and the rest lives outside the repository. What is in force, why, and the precedence behaviour that makes it misleading are all in [`AGENTS.md`](../AGENTS.md#shell-hygiene).

The one fact this directory adds is why `agent:check-config` refuses an `autoMode` key rather than validating one. Claude Code never reads it from a project settings file, so an entry here would sit in a reviewed, committed file doing nothing at all — a rule someone believes they set is worse than one they know they have not.
