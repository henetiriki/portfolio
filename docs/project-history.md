# Project History

This is the concise record of completed project work. It is not a substitute for Git history and deliberately omits command transcripts, exhaustive compatibility matrices and superseded investigations. Durable rationale lives in [Engineering Decisions](decisions.md); current implementation details live in the topical documentation; unfinished work remains in the [Roadmap](roadmap.md).

## 2026-08-10 — Codecov patch coverage

- Added private-repository Codecov reporting without a stored upload secret: the existing Jest LCOV output is uploaded through GitHub OIDC, while a repository configuration requires 100% coverage of changed coverable lines and supplies concise pull-request comments plus source annotations. Jest's existing 80% global threshold remains the whole-project guard because Codecov project status is not part of the private free tier. GitHub branch protection still needs the first successful `codecov/patch` status before it can be selected as a required check.
- Restored whole-project coverage to 100% across statements, branches, functions and lines without coverage exclusions or ignore comments. Focused tests now cover unavailable starting camera state, marker interaction without an InfoWindow, stable marker scaling within a zoom range, the single-current-city invariant and station aggregate integrity; an unused experience-description export was removed.

## 2026-08-10 — Package metadata cleanup

- Removed the application-level `sideEffects: false` declaration so bundlers cannot treat CSS and other necessary imports as safely discardable, and removed the stale npm engine constraint because Yarn 4 is the declared package manager. The Node engine remains the deployment/runtime contract.

## 2026-08-10 — Google Maps modernisation, phases 1–4

- Replaced the archived `@googlemaps/react-wrapper` with Google's maintained `@googlemaps/js-api-loader` v2 functional API. A shared retryable singleton loads the Maps, geometry and marker libraries on demand, while `useGoogleMaps()` preserves the existing loading/error/success UI.
- Added the public Map ID at `google.maps.Map` construction and moved visual styling to its associated published cloud style, removing the incompatible embedded JSON. Responsive zoom remains a later mutable option; raster rendering was retained while this boundary was verified.
- Replaced deprecated classic markers and `google.maps.Symbol` icons with accessible `AdvancedMarkerElement` custom elements and DOM-backed SVG pins. CSS recreates drop/bounce motion, the current InfoWindow anchoring API preserves marker details, DOM transforms retain zoom-responsive scaling, and all timers/listeners/map assignments clean up on unmount. Reduced-motion behaviour and the focused SDK mock/tests were migrated with the runtime implementation.
- Completed the final Maps audit: replaced the initial linear drop approximation with Google's documented Advanced Marker bounce-drop keyframes; restored Google's native accessible InfoWindow close control and Escape/focus behaviour while preserving timed auto-close; replaced HTML-string content with semantic DOM nodes; made `MarkerLegend` share the live markers' exact SVG path, colors and scales; and removed the unused `@googlemaps/typescript-guards` dependency and its Next/Jest transpilation compatibility configuration.
- Switched the independently verified Map ID to vector rendering, then replaced the network-speed-sensitive whole-level reveal with a fixed-duration fractional camera animation. Its endpoint is derived from whichever single city fixture is marked `current`, reduced-motion users move there immediately, and animation cleanup is covered by focused tests. Mossel Bay became the current city; Eastbourne and Wellington were added before the previous Silverstream location; and the native InfoWindow close button received contrast/alignment styling without replacing its SDK behaviour.
- Made only the header-adjacent `content-top` wave eager after runtime LCP detection identified it as the page's largest paint candidate. Lower content/footer waves remain lazy, and the decorative SVG is not promoted to a head preload.

## 2026-08-09 — Current platform and release hardening

- Upgraded Next.js 15 to 16, Mantine 7 through 9, and the ESLint toolchain to ESLint 9. Next development uses Turbopack while production builds explicitly use webpack for stable Serwist support. Mantine's v9 radius change is pinned back to the previous `sm` design. See [Development Workflow](development.md) and [Styling & Theming](styling-theming.md).
- Upgraded TypeScript 5.9 to the 6.0 bridge release. Removed deprecated `baseUrl` and Node 10 module resolution, made path mappings explicitly relative, and declared the only global type packages the application needs (`google.maps`, `jest`, `node`) under TypeScript 6's new empty-by-default `types` behavior. TypeScript 7 remains separately blocked in the [Roadmap](roadmap.md#framework--dependency-upgrades).
- Completed the React hook lint cleanup without suppressions. Navigation state is derived during render, deferred map work is observer-driven, Maps SDK objects have stable lifecycles, route-background state has one source of truth, and the obsolete Maps deep-comparison hook and `fast-equals` were removed.
- Replaced `eslint-plugin-typescript-sort-keys` with `eslint-plugin-perfectionist`, moved the flat config to ESLint core's `defineConfig()`, and supplied genuinely missing forwarded peers through Yarn `packageExtensions`. Immutable installs and peer explanations are warning-free; the replacement interface and enum rules were proved with failing and autofixed fixtures. See [Development Workflow](development.md#linting--formatting).
- Hardened the contact pipeline: method/body validation, bounded and safely rendered input, stable public errors, redacted logging, one bot check and transporter per request, and non-fatal courtesy-confirmation failure. See [Contact Feature](contact-feature.md).
- Expanded the single free-plan-friendly CI job with service-worker type checking, generated CSS-variable validation, a production-like PWA build, service-worker output verification, concurrency cancellation, least-privilege permissions, Yarn caching and Next build caching. Safe dummy build variables are declared in the workflow rather than requiring repository secrets.
- Added weekly Dependabot version updates for the Yarn 4 dependency graph and GitHub Actions. Minor and patch packages are grouped by production/development scope, Action updates are grouped separately, majors remain individually reviewable, and known TypeScript/Babel/Node-type/ESLint routine major updates are explicitly ignored until their coordinated-upgrade prerequisites are met without suppressing security updates.
- Fixed the route-loading state machine, restored form error borders and keyboard flow, brought the mobile menu back to production parity, and converted remaining Mantine migration patterns to documented v7+ APIs.
- Replaced render-blocking Google font stylesheets with self-hosted `next/font` assets while preserving Mantine's Roboto/Montserrat split, restored server rendering for `Footer` and `ContactForm`, and fixed the containing block and responsive `sizes` metadata for portfolio `Image fill` elements.
- Consolidated canonical, title, description, Open Graph and Twitter metadata behind a shared per-page `Seo` component, removed obsolete keyword metadata, and aligned the install surface with the dark theme using standalone PWA presentation. Decorative waves and the small navigation logo now load normally while the fixed background remains the deliberate preloaded LCP image.
- Added a concise static `/llms.txt` discovery file for AI agents, covering the five public content routes without exposing private contact or anti-automation details.
- Hardened the remaining shared/API edges with typed fetch failures, bounded retries, non-mutating random selection, method guards and explicit cache policy. Delayed Maps work now cancels cleanly, while navigation uses a semantic 44px scroll control, threshold-only passive scroll handling, larger mobile links and reduced-motion alternatives for smooth scrolling and decorative animation.
- Verified the release line with linting, both TypeScript projects, formatting, generated CSS-variable integrity, full Jest coverage, standard and PWA builds, and targeted browser QA. The subsequent Codecov pass added a station aggregate integrity test that exercises every named fixture export, bringing statement coverage up to the existing 100% branches/functions/lines result.

## 2026-08-08 — React 19 and the Mantine styling migration

- Upgraded React 18 to 19 after auditing every React-consuming dependency and checking the transitive `react-transition-group` path. Runtime behaviour stayed unchanged; the source edits were limited to React 19's ref and type definitions.
- Migrated Mantine 6 to 7, removing `@mantine/next` and Emotion in favour of CSS Modules, theme variables and Mantine's PostCSS preset. The initial pass was revisited after finding missing vendor-prefix processing, an incorrectly converted raw breakpoint and an unnecessary runtime custom-property pattern.
- Completed page-by-page parity work for background layering, wave heights, image alignment, paragraph margins, component colour shades, inherited heading typography, footer fonts, validation colours/borders and textarea sizing. These lessons are retained in [Styling & Theming](styling-theming.md), beside the code patterns they constrain.
- Replaced deprecated `next/config` runtime configuration with build-time `NEXT_PUBLIC_*` exposure while keeping server-only values private. See [Environment Variables](environment-variables.md).
- Added generated Mantine custom-property declarations for WebStorm inspection without importing or committing the generated file.

## 2026-08-07 — Framework, PWA, security and coverage foundations

- Raised coverage to 100% branches/functions/lines and installed an 80% global regression floor. The testing pass covered pure utilities, hooks, contact delivery, components, the Maps layer and page routes. See [Development Workflow](development.md#testing).
- Migrated `next/legacy/image` to `next/image`. The custom shimmer is passed directly as a data-image placeholder so Next does not apply an additional blur pipeline.
- Replaced unmaintained `next-pwa` with Serwist while preserving the existing offline route and opt-in production behaviour. See [PWA & SEO](pwa-seo.md).
- Upgraded Next.js 14 to 15, removed obsolete configuration, declared allowed image quality, and moved a types-only file out of `pages/api` after confirming that the Pages Router treated it as a broken endpoint.
- Upgraded Nodemailer to address its security advisories and added Vercel Analytics plus Speed Insights for their distinct page-view and web-vitals roles.
- Fixed a dead custom Maps comparator and a live-`Set` mutation in the Google Maps test mock. The latter had caused recursively registered listeners to fire within the same dispatch and exhaust the heap; the mock now snapshots listeners like real event systems.

## 2026-08-06 — Runtime, testing and CI baseline

- Upgraded the project to Node 24 and aligned the engine, local runtime file and type declarations.
- Added Jest, React Testing Library and the first whole-project test harness, including the custom render helper and Google Maps SDK mock.
- Added GitHub Actions validation for pull requests and pushes to `main`.
- Fixed two travel-map regressions: marker sequencing no longer receives a zero multiplier, and viewport resizing no longer resets a user's chosen zoom. Both behaviours have regression coverage in the travel component tests.
