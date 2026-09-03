---
name: release-ready-check
description: The checks to run before opening a pull request in this repository, and what a "release ready check" or "prepare for release" request means — the full pre-merge half of the release checklist including the documentation sweep in both directions. Use when validating a change, before opening a PR, after a rebase, or when asked to check whether something is ready to ship.
---

# Validating a change

Run these before opening a pull request; the full list, including the production build, is in the [release checklist](../../../docs/release-checklist.md).

```bash
yarn eslint:check
yarn type-check
yarn prettier:check
yarn docs:check-links
yarn agent:check-config
yarn css-vars:check
yarn test:coverage
yarn test:e2e
```

- `yarn test:e2e` needs a production build first and serves on **port 3002**. One port per owner: **3000 belongs to `next dev`** — leave whatever is running there alone, it is usually a human watching the change land — **3001 to the agent's own preview**, 3002 to the suite. `yarn agent:check-config` fails if those ever collide again.
- The service worker is a separate TypeScript project: `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json`.

## "Release ready check" and "prepare for release"

Both phrases mean the same thing: run everything above **and** the pre-merge half of the [release checklist](../../../docs/release-checklist.md) — including the production build, the sensitive-information pass over the diff, and the [documentation sweep](../../../docs/release-checklist.md#documentation-sweep) in both directions. Report what passes, what fails, and anything that needs a human decision.

The sweep is the part most easily skipped and the part that matters most: code → docs, so no doc still describes the old behaviour; and docs → code, so claims in the docs you touched still hold. Completed work is **moved** to [Project History](../../../docs/project-history.md) and **removed** from the [Roadmap](../../../docs/roadmap.md), never ticked in place.

**Re-run this after a rebase**, not only before opening the pull request. The ruleset on `main` requires branches to be up to date before merging, so a second branch has to rebase and re-run anyway — the case it exists for is two branches that each pass alone and break together.
