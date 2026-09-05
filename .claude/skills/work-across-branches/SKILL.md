---
name: work-across-branches
description: How concurrent branches are handled in this repository — rebase onto origin/main rather than merging, which two documentation files actually collide and how each resolves, minting a decision identifier, and why a clean rebase is not evidence. Use when rebasing, resolving a conflict, sequencing two open branches, or adding an entry to decisions.md or roadmap.md.
---

# Working across branches

Branches run concurrently here, and `main` is the only integration point. Merges are squashed, so a branch lands as a single commit and its own history does not survive: **rebase onto `origin/main`** rather than merging `main` into a branch, and never merge one branch into another.

- **The conflict surface is two documentation files, not the source.** [`roadmap.md`](../../../docs/roadmap.md) and [`decisions.md`](../../../docs/decisions.md) are touched by nearly every change and each is edited at a fixed anchor, so two branches collide there far more often than in `src/`. It was three until `project-history.md` was retired, which is most of what that change bought.
- **A clean rebase is not evidence.** Rebasing #164 over #165 produced three silent failures and one honest conflict: Git spliced a new section into the middle of one decision, left two identical decision headings, and re-applied an identical `.gitignore` rule a second time — all without a marker. Read the diff of every documentation file after a rebase; do not trust the exit status.
- **First check the change earns an entry at all** — whether the choice would otherwise be re-litigated, and whether you can name the alternative it discarded. See [D-260905a](../../../docs/decisions.md#d-260905a--say-what-earns-a-decision-entry-and-do-not-enforce-it-with-a-script).
- **Decision identifiers are dates, so they never collide across branches.** Mint `D-YYMMDD` plus the next free letter for that date — see [Identifiers](../../../docs/decisions.md#identifiers) and [D-260814d](../../../docs/decisions.md#d-260814d--identify-decisions-by-date-rather-than-by-sequence). Scanning the headings is not enough: [Private operational records](../../../docs/decisions.md#private-operational-records) holds letters that are minted but have no heading, and they must not be recycled. There is nothing to claim, nothing to check against other pull requests and nothing to renumber, so inbound links cannot break either.
- **A `decisions.md` conflict resolves one way**: keep both entries, newest date first, and for the same date put the later-merged one on top so the file reads in merge order.
- **In `roadmap.md`, removal wins** when one branch completes an item another merely edited. Touch `Last reviewed:` only when you have actually reviewed the whole roadmap — otherwise it is a one-line conflict on every branch.
- **Merge the smaller branch first**, then rebase the other onto it.
- **A change that rewrites either of those files wholesale needs a window with no other branches open.** Reorganising a doc every branch touches, or moving content between docs, maximises exactly the conflict the rules above exist to contain. Sequence such changes back to back, merging between, and start parallel work only afterwards.
- **Re-run the [release ready check](../release-ready-check/SKILL.md) after the rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so the second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together.
