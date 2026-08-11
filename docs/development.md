# Development Workflow

## Requirements

- Node `24.x` (pinned in `.nvmrc` as `24` and `package.json#engines`)
- Yarn `4.18.0` via Corepack (`packageManager: "yarn@4.18.0"` in `package.json`, binary vendored at `.yarn/releases/yarn-4.18.0.cjs`, config in `.yarnrc.yml`)

## Scripts (`package.json`)

| Script                              | Command                                                    | Purpose                                                                               |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `dev`                               | `NODE_OPTIONS='--inspect --trace-warnings' next dev`       | Local dev server (Turbopack) with the Node inspector attached and full warning traces |
| `build`                             | `next build --webpack && next-sitemap`                     | Production build (webpack — see below), followed by sitemap/robots generation         |
| `start`                             | `next start`                                               | Serve a production build                                                              |
| `clean`                             | `rm -rf .next`                                             | Wipe the build cache                                                                  |
| `eslint:check` / `eslint:write`     | `eslint .` [`--fix`]                                       | Lint / lint and autofix                                                               |
| `prettier:check` / `prettier:write` | `prettier . --check/--write --ignore-path .prettierignore` | Formatting                                                                            |
| `type-check`                        | `tsc --pretty --noEmit`                                    | TypeScript type checking without emitting output                                      |
| `prepare`                           | `husky install`                                            | Installs git hooks (runs automatically on `yarn install` via the `prepare` lifecycle) |
| `test`                              | `jest`                                                     | Runs the Jest suite once                                                              |
| `test:watch`                        | `jest --watch`                                             | Jest in watch mode                                                                    |
| `test:coverage`                     | `jest --coverage`                                          | Jest with a coverage report                                                           |
| `test:e2e`                          | `playwright test`                                          | Browser regression suite (see below)                                                  |
| `test:e2e:ui`                       | `playwright test --ui`                                     | Browser suite in Playwright's interactive runner                                      |
| `test:e2e:install`                  | `playwright install --with-deps chromium`                  | Fetch the browser binary (install scripts are disabled, so this is explicit)          |

## Bundlers: Turbopack in dev, webpack in builds

Next.js 16 made Turbopack the default for **both** `next dev` and `next build`. This project deliberately splits them:

- **`next dev` uses Turbopack** (the default — no flag). Verified to run this project's full PostCSS pipeline correctly: `postcss-simple-vars` substitutes `$mantine-breakpoint-*` to literal `em` values, CSS Modules hash as normal, and autoprefixer still emits vendor prefixes.
- **`next build` uses webpack** via an explicit `--webpack` flag. This is not a preference — Next 16 **hard-fails a Turbopack build when a webpack config is present**, and `@serwist/next` injects one. The PWA build (`WITH_PWA=true`, what production runs) would otherwise not build at all. `@serwist/next@10`, which may change this, is preview-only; revisit when it ships stable.

The practical consequence: **dev and production are built by different bundlers**, so a bundler-specific difference can in principle reach production without showing up locally. Keep the pre-PR production build in the [release checklist](release-checklist.md) as the thing that catches it.

`next dev` writes to `.next/dev` while `next build` writes to `.next` — they no longer collide, so a production build can run with a dev server live.

## Known dev-only console errors (Next.js 16)

Two errors appear in the browser console under `yarn dev`. Both are upstream Next.js 16 bugs, neither is caused by this app, and neither can reach production. **Nothing has been changed to silence them** — they are recorded here so they aren't re-investigated, and so a regression hiding behind them would still be noticed.

### `Refused to execute script from '.../_clientMiddlewareManifest.js'`

> Refused to execute script from `http://localhost:3000/_next/static/development/_clientMiddlewareManifest.js` because its MIME type (`application/json`) is not executable, and strict MIME type checking is enabled.

Next's dev bundler (`next/dist/server/lib/router-utils/setup-dev-bundler.js`) handles **two** manifest paths in a single branch and unconditionally sets a JSON content type on both:

```js
if (pathname.includes(devMiddlewareManifestPath) || pathname.includes(devTurbopackMiddlewareManifestPath)) {
  res.setHeader('Content-Type', JSON_CONTENT_TYPE_HEADER);
  res.end(JSON.stringify(serverFields.middleware?.matchers || []));
}
```

One of those is `_devMiddlewareManifest.json` (correct); the other is `TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST` = `_clientMiddlewareManifest.js`, which the dev renderer emits as a real `<script src="..." defer>` tag. So a `.js` script is served as `application/json`, and this app's `X-Content-Type-Options: nosniff` header (correctly) refuses to execute it.

It is inert for three independent reasons:

1. The served body is literally `[]` — no `__MIDDLEWARE_MATCHERS` assignment and no `__MIDDLEWARE_MATCHERS_CB` call. Executing it would be a no-op array literal.
2. Nothing awaits it in dev. In `next/dist/client/page-loader.js`, `getMiddleware()`'s `<script>`-based path is gated on `NODE_ENV === 'production'`; the dev path `fetch()`es the `.json` sibling instead, and `fetch` is not subject to script MIME blocking.
3. This project has no `middleware`/`proxy` file, so the matcher list is empty either way.

It cannot reach production: production builds use webpack rather than Turbopack, and the built `.next/static/<buildId>/` contains only `_buildManifest.js` and `_ssgManifest.js` — no such file and no script tag for it.

**The tempting fix is the wrong one.** The only lever is the `nosniff` header, which applies to `source: '/:path*'` in `next.config.js`. Next _merges_ header rules rather than letting a later rule unset an earlier one, so there is no way to carve out an exception — you would have to rewrite the source as a negative lookahead (`'/((?!_next/static/development).*)'`). That weakens a real security header, in production as well as dev, to hide dev-only noise from someone else's bug. Don't.

**Re-check this when** either of two things changes: a `proxy.ts`/`middleware.ts` file is added (the matcher list stops being empty), or the production build moves off `--webpack` to Turbopack once `@serwist/next@10` ships stable (that script becomes load-bearing in production, where `getMiddleware()` genuinely awaits `__MIDDLEWARE_MATCHERS_CB` behind a timeout). The MIME bug itself is specific to the dev bundler's route handler — production serves static assets with the correct type — but that is the point at which the assumption is worth re-testing rather than assumed.

### `TypeError: Cannot read properties of undefined (reading 'components')`

Thrown at `handleStaticIndicator` inside Next's HMR websocket handler while processing an `isrManifest` message, and usually preceded by `[HMR] Invalid message: {"type":"isrManifest",...}`. Entirely within `next/dist/client`. HMR does not exist in production.

## Browser regression suite

Playwright, in `e2e/`, run with `yarn test:e2e` (`--ui` for the interactive runner). It is deliberately narrower than the Jest suite: it exists to catch what jsdom structurally cannot — real layout, focus order, hydration and colour contrast. The Jest suite remains the place for logic and component behaviour.

It exists because that is this project's documented failure mode. The Mantine v7 migration passed lint, types, a production build _and_ its own visual QA, then page-by-page comparison against production found eight separate regressions; the mobile drawer needed several rounds; the shimmer has regressed twice. Whole-project Jest coverage was 100% throughout.

Constraints worth knowing before adding specs:

- **Port 3000 is fixed.** The Google Maps API key is restricted to `http://localhost:3000` and the production origin, so any other port fails Maps authorisation. `playwright.config.ts` pins it.
- **Google Maps is always blocked** (`blockGoogleMaps`). CI has only a dummy key, so a real load would behave differently there than locally — exactly the flakiness a regression suite must not have. The Maps layer has its own SDK mock and full unit coverage; the browser suite checks that the page _around_ it degrades to `MapError`.
- **Hydration is asserted directly**, by looking for a React fibre on a real node. The prerendered HTML is already complete, so "is it visible?" passes against static markup and proves nothing about interactivity.
- **Third-party frames are excluded from the axe pass.** The experience page embeds a YouTube player whose own DOM trips `aria-allowed-attr`, `aria-prohibited-attr` and `button-name`. Including it would make the check permanently red and therefore ignored.
- **The contact endpoint is always mocked.** A real submission sends an actual email through Gmail SMTP.
- **CI uses the real Cloudinary image host and real image IDs**, so axe measures contrast against the photograph that actually renders rather than a broken image. This does make the suite depend on `res.cloudinary.com` being reachable. `.env.test` keeps the localhost host because several Jest assertions encode that URL, and jsdom never fetches images.

The browser binary is installed explicitly (`yarn test:e2e:install`) rather than by a postinstall hook, because install scripts are disabled repository-wide — see [D008](decisions.md#d008--keep-the-package-managers-supply-chain-defaults).

## Linting & formatting

- **ESLint 9, flat config** (`eslint.config.mjs`). ESLint core's `defineConfig()` composes `eslint-config-next/core-web-vitals`, `eslint-plugin-react`'s `recommended` + `jsx-runtime`, `jsx-a11y`'s `recommended`, `import`'s `recommended` + `typescript`, `security`'s `recommended`, `typescript-eslint`'s `recommended`, and `eslint-config-prettier` last (to disable formatting-related rules). The former `typescript-eslint` `config()` helper is deprecated now that core provides the same functionality. Two flat-config constraints shape the file and are worth understanding before editing it:
  - **Plugins can only be registered once.** `eslint-config-next` already registers `react`, `react-hooks`, `import`, `jsx-a11y`, `@next/next` and `@typescript-eslint`; re-registering any of them is a hard `Cannot redefine plugin` error. The shared presets are therefore spread in for their rules and settings only, via a local `preset()` helper that strips the duplicate `plugins` key.
  - **A rule must be scoped to the same files its plugin was registered against.** `@typescript-eslint` is registered for `**/*.ts(x)` only, so its rules live in a `TS_FILES` block; `eslint-config-next`'s own glob excludes `.cjs`, so `react`/`import`/`jsx-a11y` rules live in a `WEB_FILES` block. Applying a rule to a file whose config never registered its plugin is also a hard error.
    - The practical effect: `postcss.config.cjs` — the only `.cjs` file in the repo — is linted by the global core rules and `security`, but not by the React or TypeScript rule sets. Confirmed by linting a scratch `.cjs` file with an unused `require` and out-of-order object keys: `unused-imports/no-unused-vars`, `padding-line-between-statements` and `sort-keys/sort-keys-fix` all fired, while `@typescript-eslint/no-unused-vars` did not. Note `eslint --print-config` is misleading here — it lists React and `@typescript-eslint` rules in the resolved object for that file even though they never apply, so check which rules _fire_ rather than what it prints.
  - Notable custom rules:
  - `no-restricted-imports`: disallows `../` — all cross-folder imports must go through a `@alias/*` path (see [Architecture](architecture.md#path-aliases)) or a same-directory `./` import.
  - `sort-keys/sort-keys-fix`, `sort-destructure-keys/sort-destructure-keys`, `perfectionist/sort-interfaces`, `perfectionist/sort-enums`, `react/jsx-sort-props`, `import/order` (alphabetized, grouped): the codebase enforces alphabetical ordering almost everywhere — object keys, destructured properties, JSX props, interface/enum members, and imports. This is why prop lists and destructuring in the source read alphabetically rather than by "logical" grouping.
  - `@typescript-eslint/consistent-type-imports`: `import type { X }` is required for type-only imports (visible throughout the codebase).
  - `react/function-component-definition` is turned **off** — both arrow-function and `function` component styles are allowed (in practice, arrow functions assigned to `const` are used consistently).
  - The React Compiler-backed `react-hooks` rules added with `eslint-plugin-react-hooks` 7 (`set-state-in-effect`, `refs`, `immutability`) are enforced as **errors**. The 10 long-standing findings originally exposed by the Next 16/ESLint 9 upgrade have been refactored rather than suppressed; a clean `yarn eslint:check` now reports no warnings.
  - `.yarnrc.yml` supplies two missing forwarded peers through `packageExtensions`: `@next/eslint-plugin-next` inherits the project's ESLint, and `eslint-plugin-perfectionist` inherits its TypeScript. These additions model the packages' real dependency requirements and remove Yarn's peer-resolution warnings; they do not suppress log output or replace either package's declared version ranges.
  - `plugin:security/recommended` flags patterns like dynamic object property access (`array[index]`) — several files carry `// eslint-disable-next-line security/detect-object-injection` comments where indexed access is intentional and safe (e.g. `reducer.ts`, `useRailTrips.ts`).
- **Prettier** (`.prettierrc.json`): single quotes (incl. JSX), no semicolon omission (`semi: true`), 80-char print width, trailing commas (`es5`), `bracketSameLine: true` (closing `>` of multi-line JSX tags stays on the last prop's line — visible throughout the component files).
- Ignores live in `eslint.config.mjs`'s `ignores` key (flat config drops `.eslintignore` entirely). It and `.prettierignore` both exclude `.yarn/`, `.next/`, Serwist's generated `public/sw.js`, and Next's generated `next-env.d.ts` — all files that are regenerated by tooling and must not be hand-edited to satisfy a linter.
- There is no `next lint`: Next.js 16 removed that command, and `next build` no longer lints as a side effect. `eslint:check` (which CI runs) and `lint-staged` (which the pre-commit hook runs) are what enforce linting. Both invoke the ESLint CLI directly against the same `eslint.config.mjs`.

## Git hooks

`.husky/pre-commit` runs `yarn lint-staged`. `lint-staged` config (in `package.json`):

```json
{
  "**/*.{cjs,js,jsx,mjs,ts,tsx}": ["eslint --fix"],
  "**/*.{cjs,html,js,jsx,json,md,mjs,scss,ts,tsx}": ["prettier --ignore-path .prettierignore --write"]
}
```

So every commit auto-fixes lint issues and reformats staged files of the listed types (including this `/docs` folder's Markdown) before the commit completes.

## Dependency update automation

`.github/dependabot.yml` enables GitHub-hosted weekly version checks for both dependency surfaces:

- The `npm` ecosystem covers this repository's root `package.json` and Yarn 4 lockfile. Minor and patch updates are grouped into separate production- and development-dependency pull requests; major updates remain individual so their migrations and compatibility constraints can be reviewed in isolation. At most five version-update pull requests may remain open for this ecosystem.
- Roadmap and toolchain blockers are enforced in the configuration rather than left for manual PR closure: routine version updates ignore majors for `typescript` while TypeScript 7 is ecosystem-blocked, `@babel/core` while Jest remains on Babel 7, `@types/node` until the deployed Node runtime moves to its next planned major, and `eslint` because a major requires a coordinated flat-config and plugin compatibility pass. Supported updates within the current major lines continue normally. GitHub does not apply `ignore.update-types` to security updates, so an advisory can still surface instead of being silently hidden. Remove each routine-update ignore only as part of completing its corresponding coordinated upgrade.
- The `github-actions` ecosystem scans `.github/workflows` from the repository root and groups available Action updates into one pull request, also with a five-PR limit.
- Both checks run on Mondays at 06:00 `Africa/Johannesburg`. Dependabot creates operational pull requests; it is not another CI validation step. Each generated pull request goes through the existing `CI` workflow like any other change.

Dependabot version updates are configured entirely in the repository and do not require a paid GitHub plan. Repository-level Dependabot alerts and security-update settings remain separate GitHub settings; this file does not imply that either setting has been enabled.

## Testing

Jest + React Testing Library were set up 2026-08-06, followed by a full tiered coverage pass (see [Project History](project-history.md)). The 2026-08-10 Codecov baseline is **100% branches, functions, lines and statements** across 268 tests. The final gaps were closed with behavioural coverage for defensive Maps paths and fixture-integrity checks: the current-city selector enforces exactly one current location, while the aggregate station list must contain every named station export. The later map-sequencing tests replaced obsolete global-flag assertions with coverage of initial tile readiness, viewport gating, per-layer completion, delayed rail data and idempotent completion. No source files or lines are ignored to produce the result. A global `coverageThreshold` in `jest.config.js` (80% branches/functions/lines/statements) fails `test:coverage` if coverage regresses below that floor — well under current coverage, so it's a regression guard rather than a target to hit.

CI uploads Jest's `coverage/lcov.info` to Codecov after that local threshold passes. The action authenticates with a short-lived GitHub OIDC token (`id-token: write` plus `use_oidc: true`), so there is no long-lived `CODECOV_TOKEN` repository or Dependabot secret. Upload discovery is disabled and the LCOV path is explicit; an upload/authentication error fails the CI job rather than silently omitting the coverage check. The Codecov GitHub App must still be installed for this private repository through the owner's Codecov account.

[`codecov.yml`](../codecov.yml) deliberately disables Codecov's whole-project status because that feature is unavailable for private repositories on the free Developer plan; Jest's 80% global threshold continues to enforce the same concern inside `CI / Validate & build`. Codecov instead requires **100% coverage of coverable lines changed by each pull request**, posts a compact patch-only comment and annotates uncovered lines through GitHub Checks. Once the first report has established the status, require both `CI / Validate & build` and `codecov/patch` in the `main` branch-protection rule; until that GitHub setting is applied, Codecov reports failures but does not itself prevent the merge. See the remaining activation step in the [Roadmap](roadmap.md#testing--automation).

Console output is muted globally during test runs: `jest.setup.ts` spies on `console.log`/`console.error`/`console.warn` in a `beforeEach` (`mockImplementation(() => {})`) and restores them in `afterEach` via `jest.restoreAllMocks()`. This keeps expected error-boundary output and jsdom's harmless "Not implemented: navigation" noise from cluttering test runs while still recording calls for assertions. The contact hardening tests now use those spies to prove delivery/rejection logs are fixed redacted messages and contain no transport detail; the production code no longer logs complete submissions or successful Nodemailer responses. A test can assert directly against the existing global spy — adding another local `jest.spyOn` is unnecessary — and `restoreAllMocks` cleans up after every test.

- **`jest.config.js`** wraps Next's own `next/jest` preset (which loads `next.config.js`-driven SWC settings and mocks CSS/image imports). `testEnvironment` is `jest-environment-jsdom`. `clearMocks: true` resets every `jest.fn()`'s call history between tests automatically — without it, a mock configured/called in one `it` block leaks its call count into the next one in the same file (found the hard way while writing Tier 3's `send.test.ts`).
- **Correction, verified while writing Tier 3**: `@alias/*` imports resolve at **SWC transform time** (the compiler rewrites the `import` specifier as part of compiling each file, driven by `tsconfig.json`'s `paths`) — confirmed there is no `@alias/*` entry anywhere in `moduleNameMapper` (`npx jest --showConfig` only lists next/jest's own CSS/image/font entries). This matters because it means alias resolution **only applies to genuine `import` syntax** (static `import` statements and dynamic `import()` expressions) — a bare string handed to `jest.mock('@alias/thing', factory)` is not import syntax, so Jest's resolver tries to resolve it as a literal path and fails with "Cannot find module". `jest.mock()` calls targeting a project file must use a real relative path from the test file instead (e.g. `jest.mock('../../../server/contact/send', ...)` — see `src/__tests__/pages/api/contact.test.ts`). This doesn't apply to mocking actual node_modules packages (`next/router`, `nodemailer`, `botid/server`, etc.) — those resolve normally since they're not aliased.
- **`jest.setup.ts`** imports `@testing-library/jest-dom` for the `toBeInTheDocument()`-style matchers, wired in via `setupFilesAfterEnv`.
- **`.env.test`** — `next.config.js` reads several `process.env` vars unconditionally at module-load time (`IMAGE_HOST_NAME`, `IMAGE_HOST_PROTOCOL`, etc. — see [Environment Variables](environment-variables.md)) and validates the resulting `images.remotePatterns` shape, so `next/jest` fails to even load the config without them. Next.js loads `.env.test` (not `.env.local`) when `NODE_ENV=test`, so this file holds committed, non-secret dummy values (fake API keys, `example.test` addresses) purely so the config validates under Jest — it is **not** a source of real credentials.
- **`src/utils/test/render.tsx`** is a custom RTL `render` (the standard Testing Library "custom render" recipe) that wraps the tree in `MantineProvider` with the app's real `theme`, and re-exports everything else from `@testing-library/react`. Tests should import `render`/`screen`/etc. from `@utils/test/render` rather than `@testing-library/react` directly, so components using theme context (for example, `useMantineTheme()`) resolve the app's custom colors and other values instead of Mantine's fallback defaults.
- Test files live in a `__tests__` folder alongside the code they cover (e.g. [`components/content/__tests__/Header.test.tsx`](../src/components/content/__tests__/Header.test.tsx)), not colocated as `Component.test.tsx`. `jest.config.js`'s `testMatch` is scoped to `src/**/__tests__/**/*.test.{ts,tsx}` specifically so this is enforced — a stray `.test.tsx` file sitting next to its source won't silently run.
  - **Exception: everything under `src/pages/`.** Next's Pages Router treats _every_ file directly under `pages/` as a route (confirmed when a types-only `pages/api/types.ts` file broke the build; see [Project History](project-history.md#2026-08-07--framework-pwa-security-and-coverage-foundations)), so a colocated `pages/__tests__/` or `pages/api/__tests__/` folder risks Next trying to build its contents as routes too. Page and API-route tests instead live in a single top-level mirror, `src/__tests__/pages/...` (e.g. `src/__tests__/pages/api/img-id.test.ts` covers `src/pages/api/img-id.ts`) — still matched by the same `src/**/__tests__/**` glob, just rooted differently.
- ESLint has a `files: ['**/*.test.{ts,tsx}', 'jest.setup.ts']` override enabling the `jest` env, so `describe`/`it`/`expect`/`jest` globals don't trip `no-undef`-style errors.
- **`next/router`'s `useRouter()`** still needs an explicit per-test mock (`jest.mock('next/router', () => ({ useRouter: jest.fn() }))` — the automatic/no-factory form of `jest.mock('next/router')` fails, since Next's real router module throws "No router instance found" when Jest's auto-mocker introspects it). See `hooks/__tests__/useLoading.test.ts` or `useIgImgId.test.tsx` for the pattern, including a small hand-rolled `on`/`off`/`emit` event-listener stub for `router.events`.
- **`src/utils/test/googleMapsMock.ts`** is a hand-built mock of the `google.maps` SDK surface, covering only what `Map`/`Marker`/`Polyline`/`MapWrapper` actually call (not the full real API) — `Map`, `marker.AdvancedMarkerElement`, `Polyline`, `InfoWindow`, `LatLng`, `LatLngBounds`, `event.addListener`/`addListenerOnce`/`removeListener`, and `geometry.encoding.decodePath`. Each mock class tracks its own instances in a `static instances[]` array (so a test can grab the specific instance a component created, e.g. `const [marker] = MockAdvancedMarkerElement.instances`) — call `installGoogleMapsMock()` once per test file and `resetGoogleMapsMock()` in `beforeEach` to clear the instance arrays between tests (`clearMocks: true` already resets every `jest.fn()` call history, but not the arrays). The Advanced Marker mock is registered as a jsdom custom element because the real class extends `HTMLElement`, which lets component tests inspect its appended SVG and dispatch `gmp-click`. `triggerMapsEvent(target, eventName, ...args)` fires a synthetic Maps event (`'zoom_changed'`, `'visible'`, `'tilesloaded'`) on a specific mock instance — the real `google.maps.event` system is a global registry keyed by `(target, eventName)`, not per-instance emitters, so the mock replicates that with a `WeakMap` and one-shot listener removal.
  - Loader and SDK tests have different boundaries: `googleMaps.test.ts` mocks `@googlemaps/js-api-loader` to cover one-time options, library selection, deduplication and retry; `useGoogleMaps.test.ts` covers React status/unmount behaviour; component tests continue to use the SDK mock only when they instantiate Maps objects.
  - **Corrected 2026-08-07** (was previously misattributed to "fake timers + `advanceTimersByTimeAsync`"): the actual bug was in `triggerMapsEvent` itself, which iterated a **live** `Set` of listeners via `.forEach()`. `Map.tsx`'s `zoomMap` re-triggers itself by registering a new `zoom_changed` listener as part of handling the previous one — and per spec, `Set.forEach` visits elements added mid-iteration, so that new listener fired immediately, in the same synchronous pass, registering another that also fired immediately — unbounded synchronous recursion, independent of fake vs. real timers (confirmed by reproducing the OOM with real timers too). Real event systems (DOM, Node's `EventEmitter`) snapshot listeners at dispatch time specifically to avoid this; fixed by spreading into an array (`[...handlers].forEach(...)`) before iterating. This unblocked testing the full recursive stepping animation directly — see `Map.test.tsx`'s "steps the zoom up one level at a time..." test, which drives it via `jest.advanceTimersByTimeAsync(80)` per step (now safe).
  - Passing a mock instance (e.g. `MockMap`) as a real component prop typed `google.maps.Map` needs an explicit `as unknown as google.maps.Map` cast — the mock deliberately doesn't implement the full real interface, so TypeScript (correctly) rejects it otherwise.
  - For testing a component that renders _other_ already-well-tested components as children (`MapWrapper` renders `Map`/`Marker`/`Polyline`, all separately covered), mock those child components out entirely (via a relative-path `jest.mock()`, per the gotcha above) rather than pulling in the full `google.maps` mock again — it isolates the parent's own orchestration logic (prop wiring, map-ready/viewport gating and layer completion) from the children's internals, which is the more correct unit boundary and a lot less setup. See `MapWrapper.test.tsx`.
- **`src/utils/test/apiContext.ts`**'s `createMockApiContext(body?)` builds a minimal `{ req, res }` pair for testing Next API route handlers (`pages/api/*.ts`) — `res.status()` is a jest mock returning `{ json: jest.fn() }`, so tests assert with `expect(status).toHaveBeenCalledWith(200)` / `expect(json).toHaveBeenCalledWith(...)`. No library like `node-mocks-http` was pulled in since the handlers only ever call `res.status(n).json(data)`.
- **Testing fresh module-local state** needs `jest.resetModules()` followed by a dynamic `await import(...)` of the file under test. `googleMaps.test.ts` uses this to reset the loader's singleton promise/options state per test. The related single-test module-side-effect pattern adds `jest.doMock(moduleName, factory)` before the dynamic import; `server/contact/helpers.ts` uses that variant to replace its module-scope template read without exporting an otherwise-private function.
- **RTL/Mantine gotchas hit writing Tier 4 (components)**:
  - `<img alt="">` (any `next/image` used decoratively, e.g. `WaveWrapper`) gets an implicit ARIA `role="presentation"`, not `"img"` — `getByRole('img')` won't find it. Query via `container.querySelector('img')` instead.
  - `next/image`'s rendered `src` is never the raw path you passed in — with no custom loader configured (this project has none), it always rewrites to `/_next/image?url=<encoded>&w=…&q=…`. Assert with `.toContain(encodeURIComponent(originalUrl))`, not an exact match (see `FixedBackground.test.tsx`).
  - `getByLabelText` matches a label's full `textContent` by default, not the ARIA-computed accessible name — it does **not** exclude `aria-hidden` descendants. Mantine's `withAsterisk` renders a hidden `*` inside the label, so a Name field's label text is actually `"Name *"`. Use a regex (`getByLabelText(/^Name/)`) rather than an exact string.
  - jsdom doesn't implement `ResizeObserver` (used internally by Radix UI, which Mantine's `Drawer`/`ScrollArea` are built on) — throws `ReferenceError: ResizeObserver is not defined` the moment such a component mounts. Polyfilled once, globally, in `jest.setup.ts` (a bare-bones `observe`/`unobserve`/`disconnect` no-op class) rather than per-test.
  - Mantine's `Drawer` doesn't render its children until `opened` is `true` — it's a genuine lazy mount, not just CSS-hidden content sitting in the DOM. Don't assert on drawer content before opening it.
  - **`MantineProvider`'s `env='test'` prop** (set once, in `src/utils/test/render.tsx`) is what makes Mantine's own animated/portaled components testable at all under jsdom, and is worth understanding rather than treating as boilerplate — confirmed by reading the shipped source, not inferred from behavior: `Transition` (`@mantine/core/components/Transition/Transition.mjs`) checks `env === 'test'` and, when true, mounts/unmounts its children **synchronously**, skipping the CSS-transition-timing state machine entirely; `OptionalPortal` (`.../Portal/OptionalPortal.mjs`) checks the same flag and renders children **inline** via a `Fragment` instead of a real `ReactDOM.createPortal`. Both `Drawer` and `Modal` are built on this pair internally. Without `env='test'`, jsdom never fires real CSS `transitionend` events, so anything gated on a Mantine exit/enter transition completing would need `waitFor`/`findBy*` polling (or worse, never resolve) — with it, a synchronous `getByRole`/`queryByRole` right after the state-changing `userEvent.click()` is enough, since there's no transition to wait out.
  - Mantine's `Drawer` **no longer `aria-hide`s background content while open** (changed in v7, still the case in v8, and unrelated to `env='test'` — a real API behavior difference, not a testing artifact). Scope drawer-specific queries with `within(dialog)` since the desktop nav's own copy of the same links stays in the accessibility tree simultaneously (`Navigation.test.tsx` asserts `getAllByRole('link', { name: 'Travel' })` has length 2 for exactly this reason) — don't assume background controls are hidden or unreachable while the drawer is open.
  - `src/utils/test/render.tsx`'s custom `render` always wraps in `MantineProvider` and its `options` type explicitly omits `wrapper` (so it can't be overridden per-call). To add another provider (e.g. `PortfolioStateProvider`) for one test, nest it _inside_ the JSX passed to `render()` rather than trying to pass a `wrapper` option — `render(<PortfolioStateProvider><Footer /></PortfolioStateProvider>)`.
- **Page-level (Tier 6) findings**:
  - `next/dynamic` (`ssr: false`) components resolve their **real** target module under `next/jest` — no mock needed at all. The catch: resolution happens asynchronously (after the initial synchronous `render()` returns), so a plain `getByText` on dynamically-loaded content will either miss it or trigger an "update not wrapped in act()" warning. Await settlement with `expect(await screen.findByText(...))` before the test ends — see `index.test.tsx`'s animated role tagline. Components without render-time browser dependencies should be imported normally instead: `ContactForm` and `Footer` have focused `renderToString` coverage proving they remain safe in the server-rendered path.
  - `next/head`'s `<title>`/`<meta>` tags don't reliably land on the real `document.title`/`document.head` when a page component is rendered in isolation via RTL (outside Next's actual `_app`/`_document` runtime) — don't assert on those; stick to visible body content for page smoke tests.
  - Same pattern as `MapWrapper.test.tsx`: when a page's dynamically-imported child is itself already thoroughly tested elsewhere and heavy to set up (`travel.tsx`'s `MapWrapper`, which needs the full `google.maps` mock), mock that child out for the page test via a relative-path `jest.mock()` rather than dragging in its dependencies again — keeps page tests thin/composition-focused as intended.

## TypeScript

The project uses TypeScript 6, the final JavaScript-based bridge release before the native TypeScript 7 toolchain. The root `tsconfig.json` uses `strict: true`, `target: es2015`, `module: esnext`, `moduleResolution: bundler`, `jsx: react-jsx`, `isolatedModules: true` and `incremental: true`.

TypeScript 6 deprecates `baseUrl`, so every alias target under `compilerOptions.paths` is explicitly relative to the config (`./src/...`). It also changes the default global `types` set from every visible `@types` package to none; the root project therefore declares only `google.maps`, `jest` and `node`. Do not replace that list with `"*"`, which would restore the slower and less predictable pre-6 behavior.

The service worker remains a separate TypeScript project because its `webworker` library cannot be mixed with the application's DOM libraries. Its module resolution is also `bundler`, replacing the deprecated `node`/`node10` mode, and CI checks it independently.

## Local environment setup

1. Ensure Node 24 and Corepack-enabled Yarn 4 are active (`corepack enable` if Yarn isn't already resolving to 4.18.0).
2. `yarn install` (also runs `husky install` via `prepare`).
3. Populate `.env.local` (gitignored) with the values listed in [Environment Variables](environment-variables.md) — the contact form (`GMAIL_*`), the travel map (`GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_MAP_ID`), and image hosting (`IMAGE_HOST*`) won't function without them; the rest of the site renders fine without them.
4. `yarn dev` and open `http://localhost:3000`.

## Bundle analysis

Set `ANALYZE=true` before a build (`ANALYZE=true yarn build`) to wrap the Next config with `@next/bundle-analyzer` and get an interactive bundle-size report.
