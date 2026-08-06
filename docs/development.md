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

There is currently **no test script** and no test files in the repo — no unit/integration/e2e test tooling is configured for this project.

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

## TypeScript

`tsconfig.json`: `strict: true`, `target: es2015`, `moduleResolution: node`, `jsx: preserve` (Next.js handles the actual JSX transform), `isolatedModules: true`, `incremental: true`. No `paths` beyond the aliases listed in [Architecture](architecture.md).

## Local environment setup

1. Ensure Node 20 and Corepack-enabled Yarn 4 are active (`corepack enable` if Yarn isn't already resolving to 4.8.1).
2. `yarn install` (also runs `husky install` via `prepare`).
3. Populate `.env.local` (gitignored) with the secrets listed in [Environment Variables](environment-variables.md) — the contact form (`GMAIL_*`), the travel map (`GOOGLE_MAPS_API_KEY`), and image hosting (`IMAGE_HOST*`) won't function without them; the rest of the site renders fine without them.
4. `yarn dev` and open `http://localhost:3000`.

## Bundle analysis

Set `ANALYZE=true` before a build (`ANALYZE=true yarn build`) to wrap the Next config with `@next/bundle-analyzer` and get an interactive bundle-size report.
