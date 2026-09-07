# Drop the formatting step from the release sequence and let `lint-staged` cover it

## Context

- [D-260905b](archive/2026-09-pre-migration.md#d-260905b--number-the-release-ready-sequence-and-commit-before-the-review-runs) very nearly retired `yarn prettier:write` on the premise that `lint-staged` formats at commit time. The sweep caught it: the glob listed `scss` but not `css`, and no `yml`, while `prettier .` covers both and this repository tracks `*.module.css` and workflow YAML. The step moved ahead of the first commit instead, as cover for that gap.
- The gap is now closed at source: the glob covers every type this repository tracks that `prettier` formats. It is in `package.json`, and is quoted in `docs/development.md` — those two move together, and no third live copy is worth having.

## Decision

- The sequence has no formatting step. `lint-staged` formats what each commit stages, and every step that reads the tree reads committed work.
- `yarn prettier:write` stays as a script. It is no longer part of the sequence.

## Status

Accepted, 2026-09-07. Supersedes [D-260905b](archive/2026-09-pre-migration.md#d-260905b--number-the-release-ready-sequence-and-commit-before-the-review-runs) on its formatting step alone; the numbered sequence and the four commits inside it stand.

## Consequences

**Two cases lose their cover, and both are accepted.** A commit made with the pre-commit hook skipped, and a file the commit does not stage. Neither is what the step was written for, and `prettier:check` inside `yarn validate` still fails the branch before it reaches a pull request.

**Why not keep the step now that it costs seconds.** Because the argument for it was specific — it covered types `lint-staged` missed — and that argument is gone. A step retained past its reason is one nobody can later evaluate, and this one had already been examined twice.

**Widening the glob rather than the checklist is what makes the difference.** D-260905b's error was trusting a glob it had not read; the fix that closes the class is making the glob true, not writing a step that compensates for it being false.
