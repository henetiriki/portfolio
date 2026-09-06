# Cap automatic subagent dispatch, and hand the code review to a person

## Context

- A release-ready check auto-dispatched three subagents — the bundled code review, then `documentation-sweep` and `sensitive-information-pass` together — with a conditional re-dispatch afterwards, and the whole sequence again on every rebase.
- Each is a fresh context that re-reads the diff and the surrounding tree. [`release-ready-check`](../../.claude/skills/release-ready-check/SKILL.md) justified this as keeping the reading out of the calling session, which is true of the context window and false of total tokens — and total tokens is the limit actually being reached.
- The bundled review is documented to background into a context of its own and does not reliably do so. The three conditions that force it into the foreground cannot be checked beforehand, and a foreground run lands its reading in the calling session, which then re-sends it on every following turn.

## Decision

- The code review is **asked for, not invoked**. The hand-over is a written instruction that dispatches the review to a subagent with an empty context, rather than a bare `/code-review` a person types into the session they are already in — the isolation is the point, not who triggers it. The step is reported outstanding until its findings come back.
- The two repository agents are dispatched **once per branch, before the pull request**, and again after a rebase only where the rebase changed the diff they read.
- **One automatic hop is the cap.** A session may dispatch those two; nothing they produce dispatches anything further without a person asking.

## Status

Accepted, 2026-09-06.

## Consequences

**Why not leave the review in the sequence.** It was pulled in so that it happened as part of "run everything" rather than rarely, and handing it back reintroduces precisely that risk. Naming it a required step and reporting it outstanding mitigates that; it does not remove it. If reviews stop happening, this is the reason.

**Why not drop the review altogether**, which was the largest single saving on offer. Its findings are generic and advisory, but they are still the only line-level read of the diff in the sequence — the two agents check documentation claims and secrets, and neither looks at whether the code is correct.

**Why not re-dispatch after every rebase.** A rebase that replays cleanly onto a moved base usually leaves the diff the agents read unchanged, so the old rule bought a re-read of the same content at the price of two fresh contexts. The replacement is a condition rather than a judgement: did the rebase change the diff.

**Why not dispatch on request only**, which is cheaper again. A delegated check that silently did not run is worse than an expensive one, and "release ready" has to mean something without a person remembering each part of it.

**Why write down a cap that nothing here can violate.** Both agents hold `Glob, Grep, Read`, `agent:check-config` fails if that changes, and `.claude/settings.json` has no `Stop` or `SubagentStop` hook to fire a follow-on command. The rule is against that machinery being added without a decision, not against the tree as it stands.

- The cap is a rule rather than a mechanism: nothing fails a build if it is broken.
- `release-ready-check` loses the paragraphs describing when the review backgrounds and what to do if it does not, which stop mattering once it is not invoked from there.
