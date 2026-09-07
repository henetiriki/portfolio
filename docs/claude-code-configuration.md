# Claude Code Configuration

What `.claude/` holds, what each part of it is for, and what actually binds it.

**Everything in this directory binds Claude Code and nothing else, which is why this page is named for the tool.** The hooks run inside that harness rather than in git; the skills and agents are its own file formats; `launch.json`, `worktrees/` and `.worktreeinclude` are its features. No other tool reads any of it. The cross-tool conventions are in [`AGENTS.md`](../AGENTS.md), and this page is not a second copy of them for a different audience.

**Read the guarantee below as a property of the dispatch, not of the check.** The two review agents cannot edit because of how Claude Code dispatches them. A tool without subagents performs the same two checks itself, from the [sensitive-information](release-checklist.md#sensitive-information) and [documentation sweep](release-checklist.md#documentation-sweep) briefs, holding whatever tools it already had — so nothing there stops it resolving a finding instead of reporting it, and the restriction is not inherited by following the brief. The same applies to the hooks: they refuse what they claim to for Claude Code, and for every other tool the [shell hygiene](../AGENTS.md#shell-hygiene) and [branch name](../AGENTS.md#branch-names) rules are conventions that CI catches late or not at all.

**Three other files own the flow this directory implements, and none of them is repeated here.** [`AGENTS.md`](../AGENTS.md) holds the conventions in one-line form with pointers; the [release checklist](release-checklist.md#before-opening-the-pr) holds the numbered sequence and the standalone briefs for both review agents; [`release-ready-check`](../.claude/skills/release-ready-check/SKILL.md) holds how Claude Code performs the delegated parts. This page holds only what none of them can: what each file in the directory is, how it is selected, and what the check over it does and does not prove.

## What the directory holds

| Path                  | What it is                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `agents/*.md`         | Read-only review subagents, dispatched by name                                                                        |
| `skills/*/SKILL.md`   | Procedures loaded on demand, by description or by `/<name>`                                                           |
| `settings.json`       | The two hooks, and one `ask` permission rule                                                                          |
| `settings.local.json` | Gitignored; deliberately empty                                                                                        |
| `launch.json`         | The agent's own dev and production previews, both on port 3001                                                        |
| `worktrees/`          | Gitignored; where Claude Code creates its worktrees — see the [`worktree`](../.claude/skills/worktree/SKILL.md) skill |

`.worktreeinclude` is part of the same surface but sits at the repository root, because it configures a Claude Code feature rather than living inside its directory; the `worktree` skill covers what it copies and why.

## Skills

| Skill                                                                     | For                                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`open-pull-request`](../.claude/skills/open-pull-request/SKILL.md)       | Writing a pull request body — the human checklist, and `--body-file`         |
| [`release-ready-check`](../.claude/skills/release-ready-check/SKILL.md)   | Validating a change against the [release checklist](release-checklist.md)    |
| [`work-across-branches`](../.claude/skills/work-across-branches/SKILL.md) | Rebasing, sequencing two open branches, resolving the one file that collides |
| [`worktree`](../.claude/skills/worktree/SKILL.md)                         | Creating, working inside and removing a worktree                             |

**A skill's `description` is its entire trigger surface, and that is the least obvious thing about this directory.** Until a skill is invoked, Claude sees only its `name` and `description` — the body is not in context and cannot influence whether it is chosen. So a description that does not name the words a person actually types is a skill that never loads, and nothing anywhere reports that: the session simply does the task without the procedure, competently and wrongly. This is why the descriptions here carry the phrasings rather than only the topic — `release-ready-check` names "ready for release check", "prepare for release" and "raise a PR" because those are the requests that must reach it.

**The directory name is the slash command**, so `name` and directory have to agree; the check below asserts they do.

## The two agents

| Agent                                                                           | Reads                                                                        |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`documentation-sweep`](../.claude/agents/documentation-sweep.md)               | The diff and the tree, for documentation claims in both directions           |
| [`sensitive-information-pass`](../.claude/agents/sensitive-information-pass.md) | The diff, for credentials, private URLs, personal data and new public values |

Both are dispatched together, on the cadence [step 9](release-checklist.md#before-opening-the-pr) states. That cadence deliberately lives in three places and this is not one of them: read it from step 9, or from either agent's own `description`, which carries it because that is the field a dispatching tool matches on — prose elsewhere cannot correct a description that still describes the old trigger. See the [dispatch decision](decisions/2026-09-06-dispatch-the-agents-on-the-work-not-the-pull-request.md).

**`tools: Glob, Grep, Read` is the guarantee, not configuration around it** — see D-260904d, which is the decision the list implements. An agent with no `tools` line inherits every tool the session has, `Edit` included, so the line's presence is what makes these reviewers rather than fixers. Three consequences follow from the list, and only the first is the point:

- **Neither can resolve a finding instead of reporting it.** An agent that can fix something can hide that it found it, and for a committed secret the fix is rotation by a person rather than a deletion in a later commit.
- **Neither can run `git`.** That is why the caller writes the diff to a file outside the repository and hands over the path.
- **Neither can dispatch a further agent.** That is this list's contribution to the one-hop cap on automatic dispatch; the cap itself, and why it is a rule rather than a mechanism, belong to [its decision](decisions/2026-09-06-cap-automatic-subagent-dispatch.md).

**`tools` narrows; a skill's `allowed-tools` widens, and the two must not be read as the same field.** `tools` replaces everything the session has with a named list. `allowed-tools` is a grant — calls a skill may make without prompting. No skill here declares one, so each runs against the session's own permission surface. The distinction matters because a doc that blurs it makes `allowed-tools: Edit` on an agent look like an ordinary frontmatter edit, when it is the one edit that would undo what these agents exist for. Nothing in `agent:check-config` reads `allowed-tools`; its tool check runs over `agents/` alone.

## The code review is not in this directory

It is Claude Code's own bundled `code-review` skill, asked for rather than invoked, and nothing here dispatches it — which is why the directory holds two agents and not three. How it is handed over is on the [release checklist](release-checklist.md#code-review).

## Hooks

Both hooks are configured in `settings.json` and documented in [Git hooks](development.md#git-hooks), a section that disclaims its own heading a few paragraphs in. They stay there rather than moving here because the `PostToolUse` hook reads the extensions it covers out of the `lint-staged` block that section quotes, so the paragraph is only legible beside it — proximity, not a copy that moving would duplicate.

## What `agent:check-config` proves

`yarn agent:check-config` runs [`scripts/check-agent-config.mjs`](../scripts/check-agent-config.mjs), and is one of the steps CI [never gates](release-checklist.md#pull-request). The consequence for this directory: on a change that touches only `.claude/`, it is the only step in CI that reads the agents' tool restriction at all.

It establishes three different kinds of thing, and they are worth telling apart:

- **Behaviour, by execution.** It runs the command string `settings.json` declares, against a table of commands, and asserts each verdict. Running it is the only way to test the hook rather than a re-implementation of it, and it matters because the hook fails open — a broken escape is otherwise silent.
- **Shape, by reading.** `settings.json` parses and carries no key beyond `hooks` and `permissions`; no `autoMode` key in either settings file; permission lists sorted and `allow` empty; hook entries well-formed and every `${CLAUDE_PROJECT_DIR}` path resolving; each skill directory holding a `SKILL.md` whose `name` matches it and whose `description` is non-empty; every agent — at any depth under `agents/`, since a file the walk misses is unchecked rather than reported — carrying a matching `name`, a description, and a sorted `tools` list drawn only from `Glob, Grep, Read`; and no launch configuration binding the browser suite's port.
- **Prose, by substring, once.** The `release-ready-check` body, frontmatter stripped, still contains `code-review`. It is the only prose check in the script, and it exists because "ask for a review" is one imperative sentence with no script or hook behind it — the instruction whose loss nothing else would notice.

**What it does not prove is the half worth knowing.** A description is checked for existing, never for triggering; the failure mode this directory is most exposed to is exactly the one no check can see. The substring check cannot tell an instruction from a mention — and because the skill's body now describes this very check by name, that sentence alone would keep it green with the instruction gone. No other skill's prose is read by anything but `docs:check-links`. Skills are walked one directory deep, unlike agents. And `settings.local.json` is gitignored, so CI never sees it; it is checked only when it happens to be present locally.

## The permission surface is mostly not in this repository

A reader looking here for the configuration that governs what an agent may do will not find it: both project settings files are deliberately near-empty, and the rest lives outside the repository. What is in force, why, and the precedence behaviour that makes it misleading are all in [`AGENTS.md`](../AGENTS.md#shell-hygiene).

The one fact this directory adds is why `agent:check-config` refuses an `autoMode` key rather than validating one. Claude Code never reads it from a project settings file, so an entry here would sit in a reviewed, committed file doing nothing at all — a rule someone believes they set is worse than one they know they have not.
