# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-16.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D-260806a](decisions.md#d-260806a--track-active-lts-nodejs-releases).

## Performance, SEO & platform polish

- [ ] **Confirm the white band behind the Android gesture bar clears once Chrome stable ships the upstream fix.** Nothing to build — the fix merged into Chromium `main` on 2026-08-06 and colours the navigation bar from `theme_color`, already correct here. See [D-260815i](decisions.md#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar).
  - **Earliest realistic check is late September 2026**, since `main` reaches stable in roughly four to ten weeks. Install the app on Android and confirm the region behind the gesture bar is `#080a20`.
  - **If it has not cleared by then, check the killswitch before rebuilding a workaround.** The fix ships behind `WebAppNavigationBarThemeColor`, default-on — a disabled or reverted flag would look identical to no fix at all.
  - **Two workarounds already exist and were discarded deliberately**, so neither needs rediscovering: reverting `display` to `fullscreen` (one word, costs the Android status bar permanently, iOS unaffected) and `viewport-fit=cover` (needs `env(safe-area-inset-*)` on the sticky header, the fixed scroll-to-top control, the footer's bottom band and the full-screen mobile drawer — the drawer least certain, since its close button is absolutely positioned and it could not be opened under browser automation to verify).

- [ ] **Decide how to prompt periodic manual review of the splash device table — device coverage only, not internal consistency.** The set is correct as of 2026-08-15 ([D-260815e](decisions.md#d-260815e--generate-the-pwa-icon-and-splash-set-from-one-vector-master)); the generator is committed and `yarn icons:check` now guards internal consistency in CI — both as of 2026-08-21, see [Project History](project-history.md). **Apple shipping a screen size the table doesn't have is not automatable**, per [D-260821i](decisions.md#d-260821i--rely-on-manual-review-for-splash-device-coverage-not-an-automated-check) — there is no source to check the table against, so this is deliberately left to periodic manual review rather than a check that can't exist. Candidate mechanisms for prompting that review, none chosen yet:
  - A recurring reminder (e.g. a scheduled task) to re-research current Apple hardware against the table, on a fixed interval.
  - Timed to Apple's own announcement cadence (new iPhones each September, iPads less predictably) rather than an arbitrary interval.
  - Cross-referencing a third-party device-size list another PWA tool maintains (e.g. `pwa-asset-generator`, iosres.com) as a starting point during that review, rather than researching from zero each time — unverified how current or trustworthy any such list actually is.
