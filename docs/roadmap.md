# Roadmap

Open work only. A completed item is simply removed — the merged pull request is the record that it happened, and current behaviour goes to the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-09-07.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint` also still declares a `typescript` peer range below `6.1.0` (checked through 8.69, 2026-09-03). Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime.

- [ ] **Drop the `@serwist/next/browserslist` resolution once the upstream pin moves.** `package.json` carries a `resolutions` entry forcing `^4.28.7` because `@serwist/next` pins `browserslist` to the vulnerable `4.28.6` exactly, and its latest release still does. Check it at the next `@serwist/next` upgrade: if the published `dependencies` block names anything `4.28.7` or later, remove the entry, run `yarn install` and confirm `yarn npm audit --all --recursive` stays clean. An override left behind after upstream has moved is worse than none — it pins the graph to a range nobody is watching any more.

## CI & security hardening

- [ ] **Decide whether `update-visual-baselines.yml` accepts `dependabot/` branches, and document the decision beside its guard.** Its allowlist excludes that prefix although the [branch-name check](../AGENTS.md#branch-names) accepts it. Allowing it lets a write-enabled job push to a branch Dependabot may force-push; excluding it requires rebasing a visual bump onto `chore/` before updating baselines.

- [ ] **Upgrade ESLint off `9.39.5`.** `yarn npm audit --all` flags it as a deprecated, no-longer-supported version (moderate severity); it's a development-only dependency so there's no production exposure, but it's currently excluded from Dependabot's automated major-version updates (see `.github/dependabot.yml`'s `ignore` list) pending a coordinated config/plugin compatibility pass.

## Agent configuration

- [ ] **Choose the code-review effort level using a representative change under `src/`.** The existing measurement covers only a small script-and-documentation change, so it cannot show whether the default finds enough in application code. Compare review quality and cost in a fresh review session; nothing needs building.

- [ ] **Decide whether the public `meet.ouwl.house` redirect should expose a permanent Google Meet room.** The code in [`next.config.js`](../next.config.js) is not a credential, but an anonymous visitor can use it to enter a meeting; assess that capability through the approved private process.

- [ ] **Verify push protection covers recognised provider keys and non-provider secret patterns.** Check live state through the approved private process before acting.

## Documentation weight

- [ ] **Bring the over-length comment blocks under the four-line limit.** The backlog spans `e2e/`, `scripts/`, `src/`, the root config files and `.github/` — measure accordingly rather than trusting an old count, since the counting tool must handle CSS block-comment continuation lines correctly and apply the four-line threshold consistently. Each block needs a destination decided individually, not a blanket pass: most should simply shrink to fit, but some — like the ones in [`helpers.ts`](../e2e/support/helpers.ts) and [`accessibility.spec.ts`](../e2e/accessibility.spec.ts) — explain what a check cannot see and belong in the topical doc beside that check instead of being trimmed away.

## Documentation gaps

- [ ] **Define when a repository setting may be named publicly — blocked on maintainer guidance.** The proposed boundary is whether its value is externally observable and has no security function; exact protections, exemptions and monitoring remain private. Confirm that no broader private rule applies, then align existing mentions.

- [ ] **Add the missing scripts to both command tables.** The root [`README.md`](../README.md) omits `validate`, `branch:check` and `test:e2e:maps-smoke`; [`development.md`](development.md#scripts-packagejson) omits `test:e2e:maps-smoke`.

## Code quality follow-ups

- [ ] **Consider phonetic exceptions for `useArticleAgreement`.** It matches the leading letter rather than sound, so future words such as "European" or "MBA" would choose the wrong article. The current author-controlled word list has no exception.

## Content & copy

- [ ] **Decide whether experience entries remain factual or become conversational.** Apply the choice across the whole history to avoid a visible seam. A middle path is factual past tense by default with one voice sentence only where an entry has a genuine story.

## Performance, SEO & platform polish

- [ ] **Confirm Chrome stable clears the white band behind Android's gesture bar.** Test an installed app after the upstream `theme_color` fix reaches stable. If it remains, check whether the fix is disabled or reverted before reconsidering `fullscreen` or `viewport-fit=cover`; both workarounds have user-interface costs.
