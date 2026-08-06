# Development Workflow

## Requirements

- Node `^20` (pinned in `.nvmrc` as `20`), npm `^10` (per `package.json#engines`, though the project uses Yarn day-to-day)
- Yarn `4.8.1` via Corepack (`packageManager: "yarn@4.8.1"` in `package.json`, binary vendored at `.yarn/releases/yarn-4.8.1.cjs`, config in `.yarnrc.yml`)

## Scripts (`package.json`)

| Script                              | Command                                                    | Purpose                                                                               |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `dev`                               | `NODE_OPTIONS='--inspect --trace-warnings' next dev`       | Local dev server with the Node inspector attached and full warning traces             |
| `build`                             | `next build && next-sitemap`                               | Production build, followed by sitemap/robots generation                               |
| `start`                             | `next start`                                               | Serve a production build                                                              |
| `clean`                             | `rm -rf .next`                                             | Wipe the build cache                                                                  |
| `lint:check` / `lint:write`         | `next lint` [`--fix`]                                      | Next.js's own ESLint integration                                                      |
| `eslint:check` / `eslint:write`     | `eslint .` [`--fix`]                                       | Direct ESLint invocation (same config, run outside the Next.js CLI wrapper)           |
| `prettier:check` / `prettier:write` | `prettier . --check/--write --ignore-path .prettierignore` | Formatting                                                                            |
| `type-check`                        | `tsc --pretty --noEmit`                                    | TypeScript type checking without emitting output                                      |
| `prepare`                           | `husky install`                                            | Installs git hooks (runs automatically on `yarn install` via the `prepare` lifecycle) |
| `test`                              | `jest`                                                     | Runs the Jest suite once                                                              |
| `test:watch`                        | `jest --watch`                                             | Jest in watch mode                                                                    |
| `test:coverage`                     | `jest --coverage`                                          | Jest with a coverage report                                                           |

## Linting & formatting

- **ESLint** (`.eslintrc.cjs`) extends `next/core-web-vitals`, `plugin:react/recommended`, `plugin:jsx-a11y/recommended`, `plugin:@typescript-eslint/recommended`, `plugin:import/recommended` + `import/typescript`, `plugin:security/recommended`, and `prettier` (to disable formatting-related rules). Notable custom rules:
  - `no-restricted-imports`: disallows `../` — all cross-folder imports must go through a `@alias/*` path (see [Architecture](architecture.md#path-aliases)) or a same-directory `./` import.
  - `sort-keys/sort-keys-fix`, `sort-destructure-keys/sort-destructure-keys`, `typescript-sort-keys/interface`, `react/jsx-sort-props`, `import/order` (alphabetized, grouped): the codebase enforces alphabetical ordering almost everywhere — object keys, destructured properties, JSX props, interface members, and imports. This is why prop lists and destructuring in the source read alphabetically rather than by "logical" grouping.
  - `@typescript-eslint/consistent-type-imports`: `import type { X }` is required for type-only imports (visible throughout the codebase).
  - `react/function-component-definition` is turned **off** — both arrow-function and `function` component styles are allowed (in practice, arrow functions assigned to `const` are used consistently).
  - `plugin:security/recommended` flags patterns like dynamic object property access (`array[index]`) — several files carry `// eslint-disable-next-line security/detect-object-injection` comments where indexed access is intentional and safe (e.g. `reducer.ts`, `useRailTrips.ts`).
- **Prettier** (`.prettierrc.json`): single quotes (incl. JSX), no semicolon omission (`semi: true`), 80-char print width, trailing commas (`es5`), `bracketSameLine: true` (closing `>` of multi-line JSX tags stays on the last prop's line — visible throughout the component files).
- `.eslintignore` / `.prettierignore` both exclude `.yarn/`, `.next/`, and the `next-pwa`-generated `public/fallback-*.js` / `public/sw.js` / `public/workbox-*.js`.

## Git hooks

`.husky/pre-commit` runs `yarn lint-staged`. `lint-staged` config (in `package.json`):

```json
{
  "**/*.{cjs,js,jsx,mjs,ts,tsx}": ["eslint --fix"],
  "**/*.{cjs,html,js,jsx,json,md,mjs,scss,ts,tsx}": ["prettier --ignore-path .prettierignore --write"]
}
```

So every commit auto-fixes lint issues and reformats staged files of the listed types (including this `/docs` folder's Markdown) before the commit completes.

## Testing

Jest + React Testing Library, set up 2026-08-06 (see [Roadmap](roadmap.md) — the harness itself is done; the tiered coverage work it unblocks is still open).

- **`jest.config.js`** wraps Next's own `next/jest` preset (which loads `next.config.js`-driven SWC settings and mocks CSS/image imports). `testEnvironment` is `jest-environment-jsdom`. `clearMocks: true` resets every `jest.fn()`'s call history between tests automatically — without it, a mock configured/called in one `it` block leaks its call count into the next one in the same file (found the hard way while writing Tier 3's `send.test.ts`).
- **Correction, verified while writing Tier 3**: `@alias/*` imports resolve at **SWC transform time** (the compiler rewrites the `import` specifier as part of compiling each file, driven by `tsconfig.json`'s `paths`) — confirmed there is no `@alias/*` entry anywhere in `moduleNameMapper` (`npx jest --showConfig` only lists next/jest's own CSS/image/font entries). This matters because it means alias resolution **only applies to genuine `import` syntax** (static `import` statements and dynamic `import()` expressions) — a bare string handed to `jest.mock('@alias/thing', factory)` is not import syntax, so Jest's resolver tries to resolve it as a literal path and fails with "Cannot find module". `jest.mock()` calls targeting a project file must use a real relative path from the test file instead (e.g. `jest.mock('../../../server/contact/send', ...)` — see `pages/api/__tests__/contact.test.ts`). This doesn't apply to mocking actual node_modules packages (`next/router`, `next/config`, `nodemailer`, `botid/server`, etc.) — those resolve normally since they're not aliased.
- **`jest.setup.ts`** imports `@testing-library/jest-dom` for the `toBeInTheDocument()`-style matchers, wired in via `setupFilesAfterEnv`.
- **`.env.test`** — `next.config.js` reads several `process.env` vars unconditionally at module-load time (`IMAGE_HOST_NAME`, `IMAGE_HOST_PROTOCOL`, etc. — see [Environment Variables](environment-variables.md)) and validates the resulting `images.remotePatterns` shape, so `next/jest` fails to even load the config without them. Next.js loads `.env.test` (not `.env.local`) when `NODE_ENV=test`, so this file holds committed, non-secret dummy values (fake API keys, `example.test` addresses) purely so the config validates under Jest — it is **not** a source of real credentials.
- **`src/utils/test/render.tsx`** is a custom RTL `render` (the standard Testing Library "custom render" recipe) that wraps the tree in `MantineProvider` with the app's real `theme`, and re-exports everything else from `@testing-library/react`. Tests should import `render`/`screen`/etc. from `@utils/test/render` rather than `@testing-library/react` directly, so components relying on theme context (`useMantineTheme()`, `colors: {...}` in `sx` callbacks) resolve real values instead of Mantine's fallback defaults.
- Test files live in a `__tests__` folder alongside the code they cover (e.g. [`components/content/__tests__/Header.test.tsx`](../src/components/content/__tests__/Header.test.tsx)), not colocated as `Component.test.tsx`. `jest.config.js`'s `testMatch` is scoped to `src/**/__tests__/**/*.test.{ts,tsx}` specifically so this is enforced — a stray `.test.tsx` file sitting next to its source won't silently run.
- ESLint has a `files: ['**/*.test.{ts,tsx}', 'jest.setup.ts']` override enabling the `jest` env, so `describe`/`it`/`expect`/`jest` globals don't trip `no-undef`-style errors.
- **`__mocks__/next/config.ts`** is a root-level Jest [manual mock](https://jestjs.io/docs/manual-mocks#mocking-node-modules) for `next/config`. Jest auto-applies `__mocks__/<package>` mocks for node_modules packages project-wide with no per-test `jest.mock()` call needed — this exists because several modules call `getConfig()` at module scope (`publicRuntimeConfig`/`serverRuntimeConfig`), which returns `null` under Jest otherwise (Next's runtime config is never bootstrapped outside a real Next server) and crashes on destructure. Added once `useMap`'s hook barrel-imports pulled in `MapWrapper.tsx` transitively during hook testing (Tier 2).
- **`next.config.js`'s `transpilePackages: ['@googlemaps/typescript-guards']`** — that package ships ESM-only, and `next/jest` blanket-excludes `node_modules` from its transform by design (custom `transformIgnorePatterns` in `jest.config.js` can only _append_ to that exclusion, never override it — confirmed by reading `next/jest`'s source). `transpilePackages` is the actual supported mechanism: `next/jest` reads it from `next.config.js` and swaps in a transform-aware ignore pattern automatically.
- **`next/router`'s `useRouter()`** still needs an explicit per-test mock (`jest.mock('next/router', () => ({ useRouter: jest.fn() }))` — the automatic/no-factory form of `jest.mock('next/router')` fails, since Next's real router module throws "No router instance found" when Jest's auto-mocker introspects it). See `hooks/__tests__/useLoading.test.ts` or `useIgImgId.test.tsx` for the pattern, including a small hand-rolled `on`/`off`/`emit` event-listener stub for `router.events`.
- **Known gap**: `google.maps` (used by `useDeepCompareEffectForMaps` and the `travel/` components) still needs a per-test stub when exercised directly — see `useDeepCompareEffectForMaps.test.ts` for a minimal `LatLng` mock. Nothing mocks the full Maps JS SDK yet; that's the bulk of the remaining work for the `travel/` components specifically (tracked in [Roadmap](roadmap.md)).
- **`src/utils/test/apiContext.ts`**'s `createMockApiContext(body?)` builds a minimal `{ req, res }` pair for testing Next API route handlers (`pages/api/*.ts`) — `res.status()` is a jest mock returning `{ json: jest.fn() }`, so tests assert with `expect(status).toHaveBeenCalledWith(200)` / `expect(json).toHaveBeenCalledWith(...)`. No library like `node-mocks-http` was pulled in since the handlers only ever call `res.status(n).json(data)`.
- **Mocking a module that itself calls `getConfig()` per-test** (rather than relying on the project-wide default in `__mocks__/next/config.ts`) needs `jest.resetModules()` + `jest.doMock('next/config', factory)` + a dynamic `await import(...)` of the file under test, _within that one `it` block_ — because the module under test reads `getConfig()` once at module-load time and closes over the result, a `jest.mock()`/`mockReturnValue` change after the fact doesn't affect an already-imported instance. See the last test in `pages/api/__tests__/img-id.test.ts`.
- **RTL/Mantine gotchas hit writing Tier 4 (components)**:
  - `<img alt="">` (any `next/legacy/image`/`next/image` used decoratively, e.g. `WaveWrapper`) gets an implicit ARIA `role="presentation"`, not `"img"` — `getByRole('img')` won't find it. Query via `container.querySelector('img')` instead.
  - `next/legacy/image`'s rendered `src` is never the raw path you passed in — with no custom loader configured (this project has none), it always rewrites to `/_next/image?url=<encoded>&w=…&q=…`. Assert with `.toContain(encodeURIComponent(originalUrl))`, not an exact match (see `FixedBackground.test.tsx`).
  - `getByLabelText` matches a label's full `textContent` by default, not the ARIA-computed accessible name — it does **not** exclude `aria-hidden` descendants. Mantine's `withAsterisk` renders a hidden `*` inside the label, so a Name field's label text is actually `"Name *"`. Use a regex (`getByLabelText(/^Name/)`) rather than an exact string.
  - jsdom doesn't implement `ResizeObserver` (used internally by Radix UI, which Mantine's `Drawer`/`ScrollArea` are built on) — throws `ReferenceError: ResizeObserver is not defined` the moment such a component mounts. Polyfilled once, globally, in `jest.setup.ts` (a bare-bones `observe`/`unobserve`/`disconnect` no-op class) rather than per-test.
  - Mantine's `Drawer` doesn't render its children until `opened` is `true` — it's a genuine lazy mount, not just CSS-hidden content sitting in the DOM. Don't assert on drawer content before opening it.
  - When a Mantine `Drawer`/modal opens, it correctly marks the rest of the page `aria-hidden` (standard modal accessibility pattern) — so background content, including whatever toggle button opened it, becomes invisible to the _default_ `getByRole` queries. This is correct behavior, not a bug: pass `{ hidden: true }` to inspect background DOM presence, and don't write tests that assume a user can interact with now-hidden background controls while a modal is open (e.g. can't "click the same burger to close" — a real user would use the dialog's own close control or Escape).
  - jsdom does not fire real CSS `transitionend` events, so anything whose unmount is gated on a `Transition` completing (Mantine's exit animations) will never finish in tests — don't write assertions that wait for that; scope the test to the reliably-observable open/state-change instead.
  - `src/utils/test/render.tsx`'s custom `render` always wraps in `MantineProvider` and its `options` type explicitly omits `wrapper` (so it can't be overridden per-call). To add another provider (e.g. `PortfolioStateProvider`) for one test, nest it _inside_ the JSX passed to `render()` rather than trying to pass a `wrapper` option — `render(<PortfolioStateProvider><Footer /></PortfolioStateProvider>)`.

## TypeScript

`tsconfig.json`: `strict: true`, `target: es2015`, `moduleResolution: node`, `jsx: preserve` (Next.js handles the actual JSX transform), `isolatedModules: true`, `incremental: true`. No `paths` beyond the aliases listed in [Architecture](architecture.md).

## Local environment setup

1. Ensure Node 20 and Corepack-enabled Yarn 4 are active (`corepack enable` if Yarn isn't already resolving to 4.8.1).
2. `yarn install` (also runs `husky install` via `prepare`).
3. Populate `.env.local` (gitignored) with the secrets listed in [Environment Variables](environment-variables.md) — the contact form (`GMAIL_*`), the travel map (`GOOGLE_MAPS_API_KEY`), and image hosting (`IMAGE_HOST*`) won't function without them; the rest of the site renders fine without them.
4. `yarn dev` and open `http://localhost:3000`.

## Bundle analysis

Set `ANALYZE=true` before a build (`ANALYZE=true yarn build`) to wrap the Next config with `@next/bundle-analyzer` and get an interactive bundle-size report.
