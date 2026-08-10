# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-10.

## Testing & automation

- [ ] **Block merges on coverage and add diff/patch coverage.** Jest's global 80% threshold already protects the whole project, but it cannot enforce coverage only on changed lines. Choose Codecov/Coveralls (a private-repository token and external account) or a self-hosted diff-coverage action, then require the CI check through a `main` branch-protection rule if the repository plan supports it. This combines repository configuration with workflow work; neither should be implied by a green job alone.

- [ ] **Add a small browser-level regression suite.** Keep it deliberately narrower than the Jest/RTL suite: render every content route, exercise the mobile drawer and keyboard path, check contact-form tab order and validation borders with mocked responses, and run one axe pass per page template. Playwright is the likely fit. The suite should remain cheap enough for the existing single CI job and should target browser behaviours that DOM tests have previously missed rather than duplicate page snapshots.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D002](decisions.md#d002--track-active-lts-nodejs-releases).

- [ ] **Complete the phased Google Maps modernisation.** The archived React wrapper has been replaced with Google's maintained v2 loader. Next, provision/configure a Map ID and cloud style, then migrate deprecated classic `google.maps.Marker` instances to Advanced Markers before final cleanup; see [D007](decisions.md#d007--modernise-google-maps-in-coordinated-phases). Advanced Markers use DOM-based content and new animation/cleanup approaches — there is no direct equivalent for the current symbol icons, `DROP`/`BOUNCE`, `setMap`, or zoom-scaled marker logic. Preserve loading/error states, geometry decoding, map options, information windows, marker/polyline sequencing, zoom-responsive visuals and all focused tests. Audit `MarkerLegend` alongside the marker implementation.

## Performance, SEO & platform polish

- [ ] **Modernise security and package metadata deliberately.** Remove the deprecated `X-XSS-Protection` header and introduce Content Security Policy in Report-Only first because Maps, BotID, Vercel telemetry and remote images all need an allowlist. Remove application-level `sideEffects: false` or at least mark CSS as side-effectful so tree-shaking cannot discard stylesheet imports. Drop the stale `engines.npm` constraint—the project declares Yarn and Node 24 ships a different npm major—or keep it aligned with the actual runtime.
