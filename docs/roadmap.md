# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-09.

## Testing & automation

- [ ] **Block merges on coverage and add diff/patch coverage.** Jest's global 80% threshold already protects the whole project, but it cannot enforce coverage only on changed lines. Choose Codecov/Coveralls (a private-repository token and external account) or a self-hosted diff-coverage action, then require the CI check through a `main` branch-protection rule if the repository plan supports it. This combines repository configuration with workflow work; neither should be implied by a green job alone.

- [ ] **Add a small browser-level regression suite.** Keep it deliberately narrower than the Jest/RTL suite: render every content route, exercise the mobile drawer and keyboard path, check contact-form tab order and validation borders with mocked responses, and run one axe pass per page template. Playwright is the likely fit. The suite should remain cheap enough for the existing single CI job and should target browser behaviours that DOM tests have previously missed rather than duplicate page snapshots.

- [ ] **Add Dependabot configuration.** Configure `.github/dependabot.yml` for the npm/Yarn dependency graph and GitHub Actions. Keep this separate from CI validation because it creates operational pull requests rather than validating the current commit. No paid GitHub feature is required.

## Framework & dependency upgrades

- [ ] **Upgrade TypeScript when the 7.x toolchain is supportable — blocked.** The 2026-08-09 trial of TypeScript `7.0.2` failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go port no longer ships. `typescript-eslint@8.66` and its canary also require TypeScript `<6.1.0`. Recheck only when Yarn supports the Go distribution and TypeScript-ESLint widens its range; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D002](decisions.md#d002--track-active-lts-nodejs-releases).

- [ ] **Modernise the Google Maps integration.** Replace the archived `@googlemaps/react-wrapper` and deprecated classic `google.maps.Marker` as one coordinated migration; see [D007](decisions.md#d007--modernise-the-google-maps-wrapper-and-markers-together). Advanced Markers require a `mapId`, DOM-based content and new animation/cleanup approaches—there is no direct equivalent for the current symbol icons, `DROP`/`BOUNCE`, `setMap`, or zoom-scaled marker logic. Preserve wrapper loading/error states, the geometry library, map options, information windows, marker/polyline sequencing, zoom-responsive visuals and all focused tests. Audit `MarkerLegend` alongside the marker implementation.

## Security, reliability & accessibility

- [ ] **Harden shared data utilities and API edges.** Clear `fetcher`'s abort timer in `finally`, reject with typed `Error` objects, and define retry/backoff behaviour for network failures as well as non-OK responses. Make `randomItem` synchronous and non-mutating, with an explicit empty-input contract. `/api/img-id` must handle missing or empty `ISTAGRAM_IMAGE_IDS`; `/api/img-id` and `/api/rail-trips` also need method guards and explicit cache policy.

- [ ] **Cancel delayed Maps work during cleanup.** `Marker` and `Polyline` currently discard the timer IDs from staggered `cancelableDelay` calls, allowing callbacks to attach SDK objects or dispatch loaded state after unmount. Capture and clear entrance, bounce and information-window timers; cancel `Map.zoomMap`'s recursive delay/listener chain; and prove cleanup with focused tests. Coordinate code that would be replaced wholesale with the Maps-modernisation item rather than refactoring it twice.

- [ ] **Improve navigation accessibility, mobile-menu scale and scroll performance.** Increase the mobile drawer text substantially and add matching left padding while checking narrow-screen wrapping and touch targets. Render scroll-to-top as a native button or Mantine `ActionIcon`, with a visible focus state and adequate target size. Make the scroll listener passive and update state only when the 10px threshold changes. Honour `prefers-reduced-motion` for smooth scrolling and decorative type/map animations.

## Performance, SEO & platform polish

- [ ] **Review image preloading.** Portfolio image `sizes` now follows the card grid. Reserve priority/preload for the true LCP candidate rather than every decorative wave, and review whether the 40px logo needs it. Preserve the fixed background's intentional eager/LCP behaviour separately.

- [ ] **Consolidate page SEO metadata and PWA presentation.** A shared SEO component should derive canonical URL, title, Open Graph, Twitter, description and image values from one page-level source rather than leaving homepage values on inner routes; remove obsolete keyword metadata. Align the manifest's white `background_color` with the dark theme to avoid a white install/splash flash, and decide whether `display: fullscreen` remains intentional or should become `standalone`.

- [ ] **Modernise security and package metadata deliberately.** Remove the deprecated `X-XSS-Protection` header and introduce Content Security Policy in Report-Only first because Maps, BotID, Vercel telemetry and remote images all need an allowlist. Remove application-level `sideEffects: false` or at least mark CSS as side-effectful so tree-shaking cannot discard stylesheet imports. Drop the stale `engines.npm` constraint—the project declares Yarn and Node 24 ships a different npm major—or keep it aligned with the actual runtime.
