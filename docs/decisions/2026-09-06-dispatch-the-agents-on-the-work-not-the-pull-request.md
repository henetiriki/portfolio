# Dispatch the two agents on the work being done, not on the pull request

## Context

- [Cap automatic subagent dispatch](2026-09-06-cap-automatic-subagent-dispatch.md), taken earlier the same day, stated the cadence as "once per branch, **before the pull request**". That phrase was written where the sequence it describes ends in a pull request, and it is ambiguous between naming a _position_ in that sequence and naming the _trigger_.
- Read as a trigger, it never fires for a session that commits its work and hands back without opening one. The rule then reads as deferred to a moment that may not arrive, which is indistinguishable from skipped.
- The same rewrite dropped the sentence that had said the dispatch is not request-triggered. A session afterwards skipped both agents, reasoning that it had not been asked for them and that the diff was small and obviously safe — the second half being the judgement the checklist's [sensitive-information brief](../release-checklist.md#sensitive-information) forecloses in as many words.

## Decision

- The trigger is **the branch's work being done**, whether or not a pull request follows. Position in the sequence is unchanged: the dispatch still falls at step 9, after the review's findings commit.
- The dispatch is **unconditional**. It is not request-triggered, and no reading of the change exempts it — not a small diff, not a documentation-only one, not one that looks obviously safe.
- "If an agent cannot be dispatched, do the check yourself" covers **one case**: a dispatch was attempted and failed. It is not a discretion.
- Everything else in the superseded entry stands: once per branch, that first dispatch the only run a session starts on its own, every later run suggested and waited on, one automatic hop as the cap, and the code review asked for rather than invoked.

## Status

Accepted, 2026-09-06. Supersedes [2026-09-06-cap-automatic-subagent-dispatch.md](2026-09-06-cap-automatic-subagent-dispatch.md) on the cadence clause alone.

## Consequences

**Why a superseding file rather than treating this as already implied.** The earlier entry's "Why not dispatch on request only" consequence does reject request-gating, so the unconditional half is genuinely explicit-making. The cadence half is not: "before the pull request" is in the Decision section, and a skill now says "done is the trigger rather than the pull request" in as many words. Leaving a merged decision contradicted by the file that implements it is the drift these entries exist to prevent, and the ambiguity between trigger and position is exactly what a reader a month from now cannot resolve from either file alone.

**Why the trigger is not "before pushing" or "before handing back",** both of which are more concrete. Neither covers the case of work that stops mid-branch and resumes in another session, and a trigger that fires on every hand-back would dispatch twice on a branch worked in two sittings. "Once per branch, when its work is done" keeps the count and moves only what starts it.

**What this does not restore.** Not "every time, including every rebase", which was dropped on cost and stays dropped: a re-dispatch is still conditional on the rebase or the findings commit having changed the diff the agents read, and is still suggested rather than started.

**The cadence now lives in three places, deliberately.** The [release checklist](../release-checklist.md#before-opening-the-pr)'s step 9 carries it because that page is the copy a tool without subagents reads; both agents' own `description` fields carry it because that is the field a dispatching tool matches on, and a description naming only the pull request is what would keep the old behaviour alive whatever the prose said. Neither is a summary of the skill — each is the fact at a place that acts on it.
