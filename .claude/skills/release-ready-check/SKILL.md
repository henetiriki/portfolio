---
name: release-ready-check
description: The checks to run before opening a pull request in this repository, and what a "release ready check" or "prepare for release" request means — the numbered sequence, where the commits fall in it, how the code review is handed to a person, and when the two read-only agents are dispatched. Use when validating a change, before opening a PR, after a rebase, or when asked to check whether something is ready to ship.
---

# Validating a change

**The sequence is [`release-checklist.md`](../../../docs/release-checklist.md#before-opening-the-pr), and it is numbered there rather than here.** A numbered list, with the commits as part of the order — implementation, documentation, the review's findings, then the agents'. Read it and follow it; this file adds only what is specific to Claude Code, and duplicating the ordering would give it two homes and one of them would drift. See D-260905b.

**"Release ready check" and "prepare for release" both mean the whole sequence**, reporting what passes, what fails, and anything that needs a human decision. The production build is inside it rather than an extra beyond it: `yarn validate` runs `build` and `test:e2e` itself on any change that is not documentation-only.

**Re-run it after a rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so a second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together. `yarn validate` re-runs unconditionally; the two agents do not, on the condition below.

## The code review

**Ask for it. Do not invoke it.** Say that `/code-review` should be run in a fresh session, report the step as outstanding, and carry on with the sequence — it does not block `yarn validate` or anything after it.

**A fresh session rather than this one, because backgrounding is not reliable.** The skill is documented to run as a background subagent with its own context window, and has run in the foreground here instead — when the session is non-interactive (`-p` or the Agent SDK), when a review is already in progress, or under `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, none of which you can check beforehand. A foreground run lands its reading in the calling session, which then re-sends it on every following turn. Nothing in a working session helps it read the diff, and a reviewer that has not watched the work is less anchored to the author's reasoning.

**Report it as outstanding, never as done.** A review summarised in prose cannot be told apart from no review at all. If the findings do not come back before the pull request, say so rather than letting the step disappear.

**The findings are advisory, and replace neither agent below.** They are generic — correctness, reuse, simplification, efficiency — and know nothing of this repository's own disciplines. Fix what is wrong in the change at hand, route the rest to the [Roadmap](../../../docs/roadmap.md) rather than a commit message, and treat one as blocking only where it contradicts something the [release checklist](../../../docs/release-checklist.md) demands.

**This step is Claude Code's alone**, and deliberately has no prose brief to fall back on — a review's criteria belong to the reviewing tool, so writing one here would invent a method this repository does not have. A tool without the bundled skill skips it and says so; everything else applies to every tool. `yarn agent:check-config` asserts this file still names `code-review`, which catches the section being deleted rather than proving a review happened.

## The two agents

`yarn validate` cannot perform the [documentation sweep](../../../docs/release-checklist.md#documentation-sweep) or the [sensitive-information pass](../../../docs/release-checklist.md#sensitive-information): both are judgement over prose and a diff. Both are subagents in [`.claude/agents/`](../../agents/), `documentation-sweep` and `sensitive-information-pass`, each holding `Glob, Grep, Read` and nothing else, so neither **can** fix what it finds — see D-260904d.

**Dispatch them once per branch, before the pull request** — together, since they read different things and neither waits on the other. After a rebase, re-dispatch only where the rebase actually changed the diff they read. "Every time, including every rebase" was the earlier rule and mostly bought a re-read of an unchanged diff at the price of two fresh contexts.

**One automatic hop is the cap.** This session may dispatch these two; nothing they produce dispatches anything further without a person asking for it. That holds by construction today — their tool lists cannot invoke an agent, `agent:check-config` fails if those lists change, and `.claude/settings.json` has no `Stop` or `SubagentStop` hook to fire a follow-on command — so the rule exists to stop that machinery being added without a decision.

**Hand the secrets pass a diff, not a list of files.** Write it out and do not read it yourself — the redirect is what keeps it out of this context, and added lines are what let the agent tell a dummy value this change introduced from one that was always in `.env.test`. Substitute your own scratchpad directory for `<scratchpad>`:

```bash
git diff origin/main...HEAD > <scratchpad>/diff.patch
```

**One command, because three commits already precede this** — implementation, documentation, and the code review's findings, that last one being what the ordering exists to guarantee. This used to append a second `git diff HEAD` for uncommitted work, which left a path changed both in a commit and in the working tree appearing twice in different states — something the agent had to be warned about. Committing before the review retired both the second command and the warning. If you have somehow reached this step with uncommitted changes, commit them rather than appending them.

Give both agents the diff path, and give the sweep the changed paths, which `node scripts/classify-change.mjs --explain` already prints.

**Relay what comes back, and act on it yourself.** A subagent's report is not shown to the user, so summarise it. Neither agent can resolve its own findings, which makes resolving them your job — and for a committed secret the fix is rotation by a person, never quietly deleting the line.

**If an agent cannot be dispatched, do the check yourself.** A newly written or renamed agent is not necessarily dispatchable straight away — the session that added these two could not dispatch them at first and could later, without a restart, so treat availability as something to observe rather than predict. Fall back to performing the brief inline from the [release checklist](../../../docs/release-checklist.md), and say that is what you did. A delegated check that silently did not run is worse than an expensive one.

**Three bullets in the sweep stay yours.** Recording changes made outside git, adding newly discovered follow-ups, and writing down work agreed in discussion but not started all take this session as their input. The agent cannot see any of it, so it is scoped out rather than left to report a confident nothing. They land in the agents' findings commit along with what the agents themselves raise.

## What re-runs after the agents' findings commit

`yarn validate` always. An agent only where that commit touched a path that was not in the diff it read — a fix confined to files it has already seen does not earn a second pass, and one that pulls in new surface does. That is a condition you can check rather than a judgement you have to make.
