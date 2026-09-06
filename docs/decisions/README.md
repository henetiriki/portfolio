# Decision log

One decision per file, named `YYYY-MM-DD-short-slug.md`.

- **The filename is the identifier**, and there are no sequence numbers or letter suffixes. Two branches cannot mint the same name without also choosing the same slug on the same day, so the collision the old `D-YYMMDDx` scheme resolved by hand at a fixed anchor cannot happen. That is a structural fix rather than a disciplinary one, which is why it replaced a minting procedure nobody could follow wrongly and still collided.
- **Five sections, in Nygard's order**: Title, Context, Decision, Status, Consequences.
- **A merged decision is immutable.** To revise one, write a new file whose `Status:` reads `Supersedes <old file>`, and change only the `Status:` line of the old one to `Superseded by <new file>`. Never rewrite the body: what makes the record worth keeping is that it says what was believed at the time, and an edited entry can no longer be read as evidence of anything.
- **What earns a file at all** is [in `AGENTS.md`](../../AGENTS.md#documentation-discipline), stated once, and is not repeated here.
- **Move superseded and obsolete files into [`archive/`](archive/) monthly.** Nothing is deleted; the live directory just stays small enough to read through. **Not "before each release"** — every merge deploys to production here, so that would mean before every merge, which is a consolidation pass per change.

[`archive/2026-09-pre-migration.md`](archive/2026-09-pre-migration.md) is the log this directory replaced, frozen at the migration rather than converted. Its entries keep their `D-YYMMDDx` identifiers, which is what the citations left throughout the repository still resolve against, and the private-record table at its head is what stops one of those letters being read as free.
