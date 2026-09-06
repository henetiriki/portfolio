# One file per decision, and freeze the log that was one file

## Context

- The decision log was the largest file in the repository, and nearly every branch edited it at the same anchor — two concurrent branches collided there far more often than in `src/`.
- Identifiers were `D-YYMMDD` plus the next free letter. Minting one meant reading the headings **and** a table of letters that were minted but had no heading, because recycling one would silently repoint every stale inbound link at an unrelated decision.
- The proportionality audit of 2026-09-04 found 143 of 158 commits touching `docs/` against 65 touching `src/`. Two answers were already on the roadmap and are discarded below.

## Decision

- One decision per file under `docs/decisions/`, named `YYYY-MM-DD-short-slug.md`. The filename is the identifier: nothing to mint, nothing to reserve, nothing to check against other branches.
- A merged file is immutable. Revising one means writing a new file whose `Status:` supersedes it, and editing only the old file's `Status:` line.
- The previous log is frozen at [`archive/2026-09-pre-migration.md`](archive/2026-09-pre-migration.md) rather than converted.
- The format rules are in [`README.md`](README.md); what earns a file at all is stated once, in [`AGENTS.md`](../../AGENTS.md#documentation-discipline).

## Status

Accepted, 2026-09-06.

## Consequences

**Why not compact every entry**, which the roadmap had planned. It shortens the file without changing its growth rate, and it needs a window with no other branches open to do once — buying a smaller version of the same problem at the highest available cost.

**Why not fold entries per area**, revised in place with a superseded trail. That is the only shape where the file stops growing, and it requires exactly what write-once forbids: rewriting merged prose. It also needs a redirect anchor per folded identifier, which is index noise at the scale the private-record collapse had just cleared twelve of.

**Why not convert the archived entries** to the new format. Freezing keeps every `D-YYMMDDx` identifier resolvable for the citations left throughout the repository, at no cost; converting is a pass over the largest file in the repository for a reader who does not exist.

**Why not keep the archive at `docs/` depth**, where its ninety-odd relative links would have needed no rewriting. That puts the old log outside the directory that names it, to save a mechanical reroot — so the reroot happened, and [`check-doc-links.mjs`](../../scripts/check-doc-links.mjs) was made to read `docs/` recursively first, so that something verified it.

**Why not forbid topical docs from linking here**, as the proposal this came from did. A doc linking a decision does couple its accuracy to that decision's lifecycle, but the conventions already send an argument that needs a page to a doc with the comment as one line plus a pointer — a rule that cannot work if the pointer is banned.

- Citations across the repository are now bare identifiers rather than links, so nothing fails when one rots. That is only acceptable because the archive is never edited again.
- [`work-across-branches`](../../.claude/skills/work-across-branches/SKILL.md) lost its minting procedure and half its stated conflict surface.
- Whether a subagent may auto-dispatch another is raised by this change and settled separately, in [capping automatic subagent dispatch](2026-09-06-cap-automatic-subagent-dispatch.md). One file covering both would have needed superseding at once, which write-once forbids.
