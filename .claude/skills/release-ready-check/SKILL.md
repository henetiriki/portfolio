---
name: release-ready-check
description: The checks to run before opening a pull request in this repository, and what a "release ready check" or "prepare for release" request means — the full pre-merge half of the release checklist including the documentation sweep in both directions. Use when validating a change, before opening a PR, after a rebase, or when asked to check whether something is ready to ship.
---

# Validating a change

Run one command before opening a pull request:

```bash
yarn validate
```

It classifies the change and runs what that change can actually affect, in the order that fails cheapest first. A documentation-only change skips lint, both type-checks, the generated-asset checks, the production build and the browser suite — none of which it can affect — and still runs the branch-name check, formatting, the documentation-link check, the agent-configuration check and the Jest suite. Everything else runs the full set. It prints the verdict and what it skipped, so a wrong classification is visible rather than merely cheap.

**The rule is the one CI uses**, from [`scripts/classify-change.mjs`](../../../scripts/classify-change.mjs) — see [D-260904b](../../../docs/decisions.md#d-260904b--decide-documentation-only-once-and-let-both-callers-ask-it). CI re-decides for itself against `HEAD^`, so a wrong skip here costs a round trip rather than a merge. The full checklist, including what happens after the merge, is in the [release checklist](../../../docs/release-checklist.md).

- `yarn test:e2e` needs a production build first and serves on **port 3002**. One port per owner: **3000 belongs to `next dev`** — leave whatever is running there alone, it is usually a human watching the change land — **3001 to the agent's own preview**, 3002 to the suite. `yarn agent:check-config` fails if those ever collide again.

## The two checks no script can run

`yarn validate` cannot perform the [documentation sweep](../../../docs/release-checklist.md#documentation-sweep) or the [sensitive-information pass](../../../docs/release-checklist.md#sensitive-information): both are judgement over prose and a diff. Dispatch them **every time you validate before a pull request** — not only when someone says "release ready check". They are the two steps most often skipped, and it is doing the reading outside this context that makes running them every time affordable.

Both are subagents in [`.claude/agents/`](../../agents/), `documentation-sweep` and `sensitive-information-pass`. Each holds `Glob, Grep, Read` and nothing else, so neither **can** fix what it finds — see [D-260904d](../../../docs/decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit). Dispatch them together; they read different things and neither waits on the other.

**Hand the secrets pass a diff, not a list of files.** Write it out and do not read it yourself — the redirect is what keeps it out of this context, and added lines are what let the agent tell a dummy value this change introduced from one that was always in `.env.test`. Substitute your own scratchpad directory for `<scratchpad>`, and run these as separate calls:

```bash
git diff origin/main...HEAD > <scratchpad>/diff.patch
```

```bash
git diff HEAD >> <scratchpad>/diff.patch
```

```bash
git status --porcelain
```

**The committed range alone would miss the work you are validating**, which is the same trap [`classify-change.mjs`](../../../scripts/classify-change.mjs) already avoids — this check normally runs _before_ committing, so `origin/main...HEAD` sees none of it. The second command adds staged and unstaged changes to tracked files. Untracked files are in neither: `git status --porcelain` marks them `??`, and those paths go to the secrets agent as paths to read in full, because a brand-new file is the likeliest place a key arrives.

**The file is two diffs appended, so a path changed both in a commit and in the working tree appears twice**, in different states. Say so when you hand it over: the later hunks are the current ones, and a reader taking the first as final would report a line that has since been removed.

Give both agents the diff path. Give the sweep the changed paths, which `node scripts/classify-change.mjs --explain` already prints — it unions the committed range with the working tree for exactly this reason.

**Relay what comes back, and act on it yourself.** A subagent's report is not shown to the user, so summarise it. Neither agent can resolve its own findings, which makes resolving them your job — and for a committed secret the fix is rotation by a person, never quietly deleting the line.

**If an agent cannot be dispatched, do the check yourself.** A newly written or renamed agent is not necessarily dispatchable straight away — the session that added these two could not dispatch them at first and could later, without a restart, so treat availability as something to observe rather than predict. Fall back to performing the brief inline from the [release checklist](../../../docs/release-checklist.md), and say that is what you did. A delegated check that silently did not run is worse than an expensive one.

**Three bullets in the sweep stay yours.** Recording changes made outside git, adding newly discovered follow-ups, and writing down work agreed in discussion but not started all take this session as their input. The agent cannot see any of it, so it is scoped out rather than left to report a confident nothing.

## "Release ready check" and "prepare for release"

Both phrases mean the same thing: run everything above **and** the rest of the pre-merge half of the [release checklist](../../../docs/release-checklist.md), including the production build. Report what passes, what fails, and anything that needs a human decision.

The sweep is the part that matters most: code → docs, so no doc still describes the old behaviour; and docs → code, so claims in the docs you touched still hold. Completed work is **moved** to [Project History](../../../docs/project-history.md) and **removed** from the [Roadmap](../../../docs/roadmap.md), never ticked in place.

**Re-run this after a rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so a second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together.
