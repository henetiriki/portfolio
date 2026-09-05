---
name: release-ready-check
description: The checks to run before opening a pull request in this repository, and what a "release ready check" or "prepare for release" request means — the numbered sequence, where the commits fall in it, and how Claude Code runs the code review and the two read-only agents. Use when validating a change, before opening a PR, after a rebase, or when asked to check whether something is ready to ship.
---

# Validating a change

**The sequence is [`release-checklist.md`](../../../docs/release-checklist.md#before-opening-the-pr), and it is numbered there rather than here.** A numbered list, with the commits as part of the order — implementation, documentation, the review's findings, then the agents'. Read it and follow it; this file adds only what is specific to Claude Code, and duplicating the ordering would give it two homes and one of them would drift. See [D-260905b](../../../docs/decisions.md#d-260905b--number-the-release-ready-sequence-and-commit-before-the-review-runs).

**"Release ready check" and "prepare for release" both mean the whole sequence**, reporting what passes, what fails, and anything that needs a human decision. The production build is inside it rather than an extra beyond it: `yarn validate` runs `build` and `test:e2e` itself on any change that is not documentation-only.

**Re-run it after a rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so a second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together.

## The code review

**Invoke the bundled `code-review` skill** on the current diff, at its default effort. Ask for it as an instruction naming the skill rather than by pasting a `/code-review` string: it is not documented that a bare command string in a skill body reaches the `Skill` tool, whereas an imperative works either way.

**Report its findings through `ReportFindings`, which is the skill's own contract**, and restate them as `file:line — summary` lines afterwards. Do this whether or not it backgrounded: when it runs in this session, that report is the only trace the step leaves — nothing appears in the interface, and a review summarised in prose cannot be told apart from not having run one. When it does background, the report is what its findings come back as anyway.

**Do not count on it backgrounding.** It is documented to run as a background subagent with its own context window, which is where the overlap with `yarn validate` comes from. It has run in the foreground here instead, output landing in the calling context, with none of the three conditions below obviously applying. Treat backgrounding as something to observe on the day rather than to plan around. The ordering holds either way: in the foreground it is serial wherever you put it, and its findings are worth more before you have paid for a build than after.

**Do not wrap it in a subagent of this repository's own.** [D-260904d](../../../docs/decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit)'s reasoning inverts here: the sweep and the secrets pass needed agents built here because nothing provided one, while this already runs in its own context, opens the surrounding files for itself and reports through a structured findings list. Another layer would add a hop and lose that list. How broadly it reads is the effort level's business — at the default it is one careful pass over the diff with a cap on findings, and the higher levels widen it.

**Three behaviours look like faults and are not:**

- **It runs in the foreground**, its output landing in this context rather than a subagent's, when the session is non-interactive (`-p` or the Agent SDK), when a review is already in progress, or under `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.
- **The `ultra` cloud escalation never launches from a scheduled task**, and degrades to the local review without saying so.
- **A `skillOverrides` entry of `"code-review": "user-invocable-only"` makes the invocation a silent no-op.** Check that first if the review ever stops happening. It is read from user or managed settings, outside this repository — the same out-of-repo surface [`AGENTS.md`](../../../AGENTS.md#shell-hygiene) describes for the Auto mode classifier — so nothing here can see it, `yarn agent:check-config` included.

**The findings are advisory, and replace neither agent below.** They are generic — correctness, reuse, simplification, efficiency — and know nothing of this repository's own disciplines. Fix what is wrong in the change at hand, route the rest to the [Roadmap](../../../docs/roadmap.md) rather than a commit message, and treat one as blocking only where it contradicts something the [release checklist](../../../docs/release-checklist.md) demands.

**This step is Claude Code's alone**, and deliberately has no prose brief to fall back on — a review's criteria belong to the reviewing tool, so writing one here would invent a method this repository does not have. A tool without the bundled skill skips it and says so; everything else applies to every tool. See [D-260904e](../../../docs/decisions.md#d-260904e--start-the-code-review-from-the-release-ready-check-and-keep-it-claude-code-only).

## The two agents

`yarn validate` cannot perform the [documentation sweep](../../../docs/release-checklist.md#documentation-sweep) or the [sensitive-information pass](../../../docs/release-checklist.md#sensitive-information): both are judgement over prose and a diff. Dispatch them **every time**, not only when someone says "release ready check". Doing the reading outside this context is what makes that affordable.

Both are subagents in [`.claude/agents/`](../../agents/), `documentation-sweep` and `sensitive-information-pass`. Each holds `Glob, Grep, Read` and nothing else, so neither **can** fix what it finds — see [D-260904d](../../../docs/decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit). Dispatch them together; they read different things and neither waits on the other.

**Hand the secrets pass a diff, not a list of files.** Write it out and do not read it yourself — the redirect is what keeps it out of this context, and added lines are what let the agent tell a dummy value this change introduced from one that was always in `.env.test`. Substitute your own scratchpad directory for `<scratchpad>`:

```bash
git diff origin/main...HEAD > <scratchpad>/diff.patch
```

**One command, because the implementation and documentation are already committed by now.** This used to append a second `git diff HEAD` for uncommitted work, which left a path changed both in a commit and in the working tree appearing twice in different states — something the agent had to be warned about. Committing before the review retired both the second command and the warning. If you have somehow reached this step with uncommitted changes, commit them rather than appending them.

Give both agents the diff path, and give the sweep the changed paths, which `node scripts/classify-change.mjs --explain` already prints.

**Relay what comes back, and act on it yourself.** A subagent's report is not shown to the user, so summarise it. Neither agent can resolve its own findings, which makes resolving them your job — and for a committed secret the fix is rotation by a person, never quietly deleting the line.

**If an agent cannot be dispatched, do the check yourself.** A newly written or renamed agent is not necessarily dispatchable straight away — the session that added these two could not dispatch them at first and could later, without a restart, so treat availability as something to observe rather than predict. Fall back to performing the brief inline from the [release checklist](../../../docs/release-checklist.md), and say that is what you did. A delegated check that silently did not run is worse than an expensive one.

**Three bullets in the sweep stay yours.** Recording changes made outside git, adding newly discovered follow-ups, and writing down work agreed in discussion but not started all take this session as their input. The agent cannot see any of it, so it is scoped out rather than left to report a confident nothing. They land in the agents' findings commit along with what the agents themselves raise.

## What re-runs after the agents' findings commit

`yarn validate` always. An agent only where that commit touched a path that was not in the diff it read — a fix confined to files it has already seen does not earn a second pass, and one that pulls in new surface does. That is a condition you can check rather than a judgement you have to make.
