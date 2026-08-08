# Architecture

## Tech stack

| Concern         | Choice                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------ |
| Framework       | Next.js `^15.5.23`, **Pages Router** (`src/pages`)                                         |
| UI runtime      | React `^19` (`react`, `react-dom`)                                                         |
| Language        | TypeScript `^5.9`, `strict: true`                                                          |
| UI library      | Mantine v8 (`core`, `form`, `hooks`, `notifications`)                                      |
| Styling         | CSS Modules + CSS variables (`postcss-preset-mantine`, `postcss-simple-vars`)              |
| Icons           | `@tabler/icons-react`                                                                      |
| Maps            | `@googlemaps/react-wrapper` + `@googlemaps/typescript-guards` (Google Maps JavaScript API) |
| Email           | `nodemailer` over Gmail SMTP                                                               |
| Bot protection  | `botid` (Vercel BotID) client + server checks                                              |
| PWA             | Serwist (only enabled when `WITH_PWA=true`)                                                |
| Sitemap/robots  | `next-sitemap` (runs as a `build` step)                                                    |
| Package manager | Yarn 4 (Berry), Node `24.x`                                                                |
| Lint/format     | ESLint (`next/core-web-vitals` + a large custom ruleset), Prettier, Husky + lint-staged    |

## Directory layout

```
src/
  components/     Presentational/feature components, grouped by feature folder
    content/      Page chrome: Content wrapper, Header, FixedBackground, Transition
    experience/   Timeline building blocks used only by /experience
    footer/       Footer and its layout containers
    form/         ContactForm
    nav/          Navigation bar + NavigationLink
    shared/       Cross-feature: ErrorBoundary, ErrorContent, Logo, WaveWrapper
    travel/       Google Maps feature: Map, Marker, Polyline, Legend, MapWrapper, loaders
  containers/
    layout/       Layout (main content area + footer)
  fixtures/        Static content/data consumed by pages (bios, jobs, nav links, travel data)
    travel/        Cities, countries, airports, ports, stations, flights, cruises, rail trips,
                    icons, map config, polylines, types — all the map's static content
  hooks/           Reusable React hooks (see state-management.md and travel-feature.md)
  pages/           Next.js Pages Router: one file per route, plus pages/api for API routes
  server/
    contact/       Server-only logic for the contact form (validation, templating, sending)
  state/           React Context + reducer (single global app state)
  styles/          Mantine theme + custom color palette
  utils/           Small pure helpers, split into `common/` (client-safe) and page-specific
    common/         fetcher, delay, blurDataURL, randomItem, getNodeText, upperFirst
public/            Static assets, PWA manifest, icons, email-adjacent HTML templates' images,
                    portfolio screenshots, wave SVGs, and a tiny hash-redirect script
```

Nearly every folder above also has its own `__tests__/` subfolder alongside the source it covers (e.g. `src/components/travel/__tests__/`) — see [Development Workflow](development.md#testing) for the full testing setup and conventions.

## Path aliases

Defined in `tsconfig.json` (`compilerOptions.paths`) and mirrored by ESLint's import resolution:

```
@components/*  -> src/components/*
@containers/*  -> src/containers/*
@fixtures/*    -> src/fixtures/*
@hooks         -> src/hooks
@pages/*       -> src/pages/*
@server/*      -> src/server/*
@state/*       -> src/state/*
@styles        -> src/styles
@utils/*       -> src/utils/*
```

Relative parent imports (`../`) are disallowed by ESLint (`no-restricted-imports`); everything crosses folders via these aliases or a local `./` import from an `index.ts` barrel.

## Request lifecycle

1. `src/pages/_document.tsx` renders the static HTML shell: favicons, PWA manifest link, Apple splash-screen `<link>` tags for every device size, Google Fonts (`Montserrat` for headings, `Roboto` for body), and a `<script>` tag for `public/scripts/hash-redirect.js` (see [PWA & SEO](pwa-seo.md)).
2. `src/pages/_app.tsx` (`Portfolio`) wraps every page:
   - Sets page-level `<Head>` meta (title, canonical, OG/Twitter tags) shared across all routes; individual pages override the `key`-matched tags for their own description/keywords.
   - Registers `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />` so BotID instruments the contact form's POST route client-side.
   - Wraps the tree in `MantineProvider` with the custom `theme` (see [Styling & Theming](styling-theming.md)).
   - Wraps in the local `ErrorBoundary` (class component) so a render error anywhere shows a minimal "Oops" message instead of a blank page.
   - Provides `PortfolioStateProvider` (the global Context) around everything below it.
   - Renders, in order: an optional route-transition overlay (`DynamicTransition`, driven by `useLoading`), the `DynamicFixedBackground` (full-bleed Instagram-photo background), `Navigation`, then `Layout` wrapping the actual page `<Component>`.
   - `FixedBackground` and `Footer` are loaded via `next/dynamic` with `ssr: false` — they depend on browser-only viewport/state and are excluded from the server-rendered HTML.
3. `Layout` (`src/containers/layout/Layout.tsx`) is a simple flex column: a scrollable `<main>` for page content, then the dynamically-imported `Footer`.
4. Each page component (`src/pages/*.tsx`) sets its own `<Head>` overrides and renders its content, typically wrapped in the shared `Header` and `Content` components from `@components/content` for consistent hero/section styling with wave-shaped SVG dividers (`WaveWrapper`).

## Data flow

There is no external CMS or database. Content is authored directly as TypeScript/JSX fixtures under `src/fixtures/` (e.g. `experience.tsx` hard-codes the entire work history as JSX). The two exceptions that hit an API at runtime:

- `/api/rail-trips` serves static rail trip data (`@fixtures/travel/railTrips`) as JSON, consumed by `useRailTrips` — kept as an API route (rather than a direct import) presumably so it can be fetched lazily/client-side without shipping the data in the initial page bundle.
- `/api/img-id` picks a random Instagram media ID from the `ISTAGRAM_IMAGE_IDS` env var, used by `FixedBackground` to rotate the background photo per route change.
- `/api/contact` is the only route with a real side effect: it validates and emails a contact-form submission (see [Contact Feature](contact-feature.md)).
