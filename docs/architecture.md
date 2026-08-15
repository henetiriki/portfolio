# Architecture

## Tech stack

| Concern         | Choice                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| Framework       | Next.js `^16.3.0`, **Pages Router** (`src/pages`)                                       |
| UI runtime      | React `^19` (`react`, `react-dom`)                                                      |
| Language        | TypeScript `^6.0`, `strict: true`                                                       |
| UI library      | Mantine v9 (`core`, `form`, `hooks`, `notifications`)                                   |
| Styling         | CSS Modules + CSS variables (`postcss-preset-mantine`, `postcss-simple-vars`)           |
| Icons           | `@tabler/icons-react`                                                                   |
| Maps            | `@googlemaps/js-api-loader` (Google Maps JavaScript API)                                |
| Email           | `nodemailer` over Gmail SMTP                                                            |
| Bot protection  | `botid` (Vercel BotID) client + server checks                                           |
| PWA             | Serwist (every production build; never in development)                                  |
| Sitemap/robots  | `next-sitemap` (runs as a `build` step)                                                 |
| Package manager | Yarn 4 (Berry), Node `24.x`                                                             |
| Testing         | Jest + React Testing Library (units), Playwright + axe (browser)                        |
| Lint/format     | ESLint (`next/core-web-vitals` + a large custom ruleset), Prettier, Husky + lint-staged |

## Directory layout

```
src/
  components/     Presentational/feature components, grouped by feature folder
    content/      Page chrome: Content wrapper, Header, FixedBackground, Transition
    experience/   Timeline building blocks used only by /experience
    footer/       Footer and its layout containers
    form/         ContactForm
    nav/          Navigation bar + NavigationLink
    shared/       Cross-feature: ErrorBoundary, ErrorContent, Logo, Seo, WaveWrapper
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
    test/           Jest-only helpers: the custom RTL render, the Maps SDK mock, API context
public/            Static assets, PWA manifest, icons, email-adjacent HTML templates' images,
                    portfolio screenshots, wave SVGs, and a tiny hash-redirect script
e2e/               Playwright browser regression suite, with shared helpers in e2e/support/
service-worker/    Serwist service-worker source and its own tsconfig (see pwa-seo.md)
scripts/           Build-adjacent Node scripts (the generated WebStorm CSS-variable stub)
```

Nearly every folder under `src/` also has its own `__tests__/` subfolder alongside the source it covers (e.g. `src/components/travel/__tests__/`). Browser tests sit outside `src/` in `e2e/` because they exercise the built site rather than any one module — see [Development Workflow](development.md#testing) and [Browser regression suite](development.md#browser-regression-suite).

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
@styles/*      -> src/styles/*
@utils/*       -> src/utils/*
```

Relative parent imports (`../`) are disallowed by ESLint (`no-restricted-imports`); everything crosses folders via these aliases or a local `./` import from an `index.ts` barrel.

## Request lifecycle

1. `src/pages/_document.tsx` renders the static HTML shell: favicons, PWA manifest link, Apple splash-screen `<link>` tags for every device size, and a `<script>` tag for `public/scripts/hash-redirect.js` (see [PWA & SEO](pwa-seo.md)).
2. `src/pages/_app.tsx` (`Portfolio`) wraps every page:
   - Sets only app-wide `<Head>` values: the viewport and generated font custom properties. Route-specific SEO does not fall back to homepage values here.
   - Loads the repository's own Roboto and Montserrat files through `next/font/local` and exposes their generated family names to the Mantine theme as root custom properties (see [Styling & Theming](styling-theming.md#fonts)).
   - Registers `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />` so BotID instruments the contact form's POST route client-side.
   - Wraps the tree in `MantineProvider` with the custom `theme` (see [Styling & Theming](styling-theming.md)).
   - Wraps in the local `ErrorBoundary` (class component) so a render error anywhere shows a minimal "Oops" message instead of a blank page.
   - Provides `PortfolioStateProvider` (the global Context) around everything below it.
   - Renders, in order: an optional route-transition overlay (`DynamicTransition`, driven by `useLoading`), the `DynamicFixedBackground` (full-bleed Instagram-photo background), `Navigation`, then `Layout` wrapping the actual page `<Component>`.
   - `FixedBackground` and the route-transition overlay are loaded via `next/dynamic` with `ssr: false` because they depend on browser-only state or animation. Ordinary content remains server-renderable.
3. `Layout` (`src/containers/layout/Layout.tsx`) is a simple flex column: a scrollable `<main>` for page content, then the server-rendered `Footer`.
4. Each content page supplies one title/path/description source to the shared `Seo` component, which derives matching title, canonical, description, Open Graph and Twitter tags. Pages then render their content, typically wrapped in the shared `Header` and `Content` components from `@components/content` for consistent hero/section styling with wave-shaped SVG dividers (`WaveWrapper`).

## Data flow

There is no external CMS or database. Content is authored directly as TypeScript/JSX fixtures under `src/fixtures/` (e.g. `experience.tsx` hard-codes the entire work history as JSX). The three exceptions that hit an API at runtime:

- `/api/rail-trips` serves static rail trip data (`@fixtures/travel/railTrips`) as edge-cacheable JSON, consumed by `useRailTrips` — kept as an API route (rather than a direct import) presumably so it can be fetched lazily/client-side without shipping the data in the initial page bundle.
- `/api/img-id` picks a random Instagram media ID from the non-empty entries in `ISTAGRAM_IMAGE_IDS`, returns private/no-store responses, and degrades to a generic service error when no IDs are configured. `FixedBackground` uses it to rotate the background photo per route change.
- `/api/contact` is the only route with a real side effect: it validates and emails a contact-form submission (see [Contact Feature](contact-feature.md)).
