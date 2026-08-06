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

- **`jest.config.js`** wraps Next's own `next/jest` preset (which loads `next.config.js`/`.babelrc`-equivalent SWC settings, mocks CSS/image imports, and — since Next 12.1 — automatically turns the `@alias/*` paths from `tsconfig.json` into Jest `moduleNameMapper` entries, so no alias config had to be duplicated here). `testEnvironment` is `jest-environment-jsdom`.
- **`jest.setup.ts`** imports `@testing-library/jest-dom` for the `toBeInTheDocument()`-style matchers, wired in via `setupFilesAfterEnv`.
- **`.env.test`** — `next.config.js` reads several `process.env` vars unconditionally at module-load time (`IMAGE_HOST_NAME`, `IMAGE_HOST_PROTOCOL`, etc. — see [Environment Variables](environment-variables.md)) and validates the resulting `images.remotePatterns` shape, so `next/jest` fails to even load the config without them. Next.js loads `.env.test` (not `.env.local`) when `NODE_ENV=test`, so this file holds committed, non-secret dummy values (fake API keys, `example.test` addresses) purely so the config validates under Jest — it is **not** a source of real credentials.
- **`src/utils/test/render.tsx`** is a custom RTL `render` (the standard Testing Library "custom render" recipe) that wraps the tree in `MantineProvider` with the app's real `theme`, and re-exports everything else from `@testing-library/react`. Tests should import `render`/`screen`/etc. from `@utils/test/render` rather than `@testing-library/react` directly, so components relying on theme context (`useMantineTheme()`, `colors: {...}` in `sx` callbacks) resolve real values instead of Mantine's fallback defaults.
- Test files live in a `__tests__` folder alongside the code they cover (e.g. [`components/content/__tests__/Header.test.tsx`](../src/components/content/__tests__/Header.test.tsx)), not colocated as `Component.test.tsx`. `jest.config.js`'s `testMatch` is scoped to `src/**/__tests__/**/*.test.{ts,tsx}` specifically so this is enforced — a stray `.test.tsx` file sitting next to its source won't silently run.
- ESLint has a `files: ['**/*.test.{ts,tsx}', 'jest.setup.ts']` override enabling the `jest` env, so `describe`/`it`/`expect`/`jest` globals don't trip `no-undef`-style errors.
- **Known gap**: many components/hooks/pages call `getConfig()` from `next/config` at module scope (`publicRuntimeConfig`/`serverRuntimeConfig`) or depend on `next/router`'s `useRouter()`, global `google.maps`, or `fetch`. None of that is mocked yet — only `next/config`'s dependency on `.env.test` is currently handled (indirectly, via the file above). Components that call `getConfig()` or `useRouter()` directly will need per-test mocking before they can be tested; this is expected, tracked as the tiered coverage work in [Roadmap](roadmap.md), not a setup defect.

## TypeScript

`tsconfig.json`: `strict: true`, `target: es2015`, `moduleResolution: node`, `jsx: preserve` (Next.js handles the actual JSX transform), `isolatedModules: true`, `incremental: true`. No `paths` beyond the aliases listed in [Architecture](architecture.md).

## Local environment setup

1. Ensure Node 20 and Corepack-enabled Yarn 4 are active (`corepack enable` if Yarn isn't already resolving to 4.8.1).
2. `yarn install` (also runs `husky install` via `prepare`).
3. Populate `.env.local` (gitignored) with the secrets listed in [Environment Variables](environment-variables.md) — the contact form (`GMAIL_*`), the travel map (`GOOGLE_MAPS_API_KEY`), and image hosting (`IMAGE_HOST*`) won't function without them; the rest of the site renders fine without them.
4. `yarn dev` and open `http://localhost:3000`.

## Bundle analysis

Set `ANALYZE=true` before a build (`ANALYZE=true yarn build`) to wrap the Next config with `@next/bundle-analyzer` and get an interactive bundle-size report.
