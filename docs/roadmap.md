# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-16.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D-260806a](decisions.md#d-260806a--track-active-lts-nodejs-releases).

## CI & security hardening

- [ ] **Upgrade ESLint off `9.39.5`.** `yarn npm audit --all` flags it as a deprecated, no-longer-supported version (moderate severity); it's a development-only dependency so there's no production exposure, but it's currently excluded from Dependabot's automated major-version updates (see `.github/dependabot.yml`'s `ignore` list) pending a coordinated config/plugin compatibility pass.

## Code quality follow-ups

- [ ] **Replace `useIntersectedOnce` with `@mantine/hooks`' `useIntersection`.** The hand-rolled hook duplicates an IntersectionObserver wrapper the project already depends on. Not a drop-in swap: Mantine's hook exposes the raw `entry` on every change rather than latching once and disconnecting, so `MapWrapper` (its only consumer) would need to own that one-shot logic itself. Deferred deliberately rather than done alongside the [D-260825e](decisions.md#d-260825e--check-intersectionratio-against-the-threshold-in-useintersectedonce-not-isintersecting) threshold fix, to keep that fix minimal.

- [ ] **Consider phonetic exceptions for `useArticleAgreement`'s vowel-sound check.** `vowelSoundPattern` matches the leading letter, not the leading sound, so a future tagline word like "European" or "MBA" would get the wrong article ("an European"). The current home-page word list doesn't trigger it, and the word list is fully author-controlled with every change subject to this repo's own preview-URL manual QA, so a wrong article would be caught immediately if it ever happened — deliberately left unfixed rather than building exceptions for words that don't exist in the sequence yet.

## Content & copy

- [ ] **Decide whether the experience-entry prose moves off its flat, factual register.** The job entries in `src/fixtures/experience.tsx` are uniformly declarative ("I joined X as a Y", "I worked in the team replacing…"), while the site's framing — the home bio, the page headers, the icon-only Flight Attendant entry — carries dry wit. Staying factual costs nothing to maintain and ages well, since enthusiasm is timestamped ("I'm excited to start this next chapter" reads oddly once the role is no longer new). Going conversational is a whole-history decision, not a per-entry one, or it leaves a visible seam around 2025. Middle path if revisited: keep entries factual and past-tense by default, allow one voice sentence per entry only where there is a genuine story (the CSA no-prior-Python line is the model), and decide the seam explicitly. Raised during the 2026-08-29 copy pass and deliberately not acted on.

## Performance, SEO & platform polish

- [ ] **Confirm the white band behind the Android gesture bar clears once Chrome stable ships the upstream fix.** Nothing to build — the fix merged into Chromium `main` on 2026-08-06 and colours the navigation bar from `theme_color`, already correct here. See [D-260815i](decisions.md#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar).
  - **Earliest realistic check is late September 2026**, since `main` reaches stable in roughly four to ten weeks. Install the app on Android and confirm the region behind the gesture bar is `#080a20`.
  - **If it has not cleared by then, check the killswitch before rebuilding a workaround.** The fix ships behind `WebAppNavigationBarThemeColor`, default-on — a disabled or reverted flag would look identical to no fix at all.
  - **Two workarounds already exist and were discarded deliberately**, so neither needs rediscovering: reverting `display` to `fullscreen` (one word, costs the Android status bar permanently, iOS unaffected) and `viewport-fit=cover` (needs `env(safe-area-inset-*)` on the sticky header, the fixed scroll-to-top control, the footer's bottom band and the full-screen mobile drawer — the drawer least certain, since its close button is absolutely positioned and it could not be opened under browser automation to verify).
