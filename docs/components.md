# Component Catalog

All components are function components (except `ErrorBoundary`) written in TypeScript, styled with Mantine's CSS Modules + CSS variables (see [Styling & Theming](styling-theming.md)). Each feature folder exports through an `index.ts` barrel, imported via the `@components/*` alias.

## `content/` — page chrome

| Component         | Responsibility                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`          | Full-height hero title block used at the top of every content page (`<Title order={1}>` + a `<span>` sub-line)                                                                                                                                                                                                                                                              |
| `Content`         | The repeated "card" section: a `WaveWrapper` top/bottom SVG divider around a semi-transparent (`valhalla`, 90% opacity) content box. `waveTop`/`waveBottom` props (both default `true`) let a page omit a divider, e.g. `/travel` hides the bottom wave on the intro `Content` and the top wave on the legend `Content` so the map sits flush between them.                 |
| `FixedBackground` | Full-viewport, fixed, `z-index: -1` background image using the current `igImgId` from state (see [State Management](state-management.md)) and `IMAGE_HOST`. Registers `pageTopRef` into global state on mount — this is the single source of truth for "top of page" used by both `Navigation`'s and `Footer`'s scroll-to-top. Loaded via `next/dynamic` with `ssr: false`. |
| `Transition`      | Full-screen dark overlay with a Mantine `Loader` (inheriting the theme's default `type='dots'`), shown while `useLoading()` reports a Next.js route change in progress.                                                                                                                                                                                                     |

## `nav/`

| Component        | Responsibility                                                                                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Navigation`     | Sticky header with `Logo`, desktop inline menu (hidden below `sm`), a `Burger`-triggered mobile `Drawer`, and a floating scroll-to-top button that appears once `window.scrollY > 10`. Background becomes opaque (`black-russian`) once scrolled or when the drawer is open. |
| `NavigationLink` | A single nav `Anchor` with an animated underline (`::before`) that's always-on for the active route (matched by exact `pathname` equality) and animates in on hover. Supports `variant='sm'` for the mobile drawer's larger touch targets.                                   |

## `footer/`

| Component                                  | Responsibility                                                                                                                                                                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Footer`                                   | Server-rendered wave dividers + primary nav links (`menuItems`) + social links (`socialLinks`, GitHub/LinkedIn/Instagram) + a copyright line and a "last built" timestamp sourced from `process.env.NEXT_PUBLIC_LAST_MODIFIED` (computed at build/boot time in `next.config.js`, Pacific/Auckland timezone). |
| `FooterContainer` / `FooterLinksContainer` | Layout-only wrappers (background color / flex arrangement) reused across the two footer bands.                                                                                                                                                                                                               |

## `form/`

| Component     | Responsibility                                                                                                                                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ContactForm` | Renders Name/Email/Message fields wired to `useMantineForm()`, plus a secondary anti-automation signal whose implementation is intentionally omitted from public documentation (see [Contact Feature](contact-feature.md)). Shows Mantine `notifications` toasts for both submit success and any API-returned error codes. |

## `shared/`

| Component       | Responsibility                                                                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ErrorBoundary` | Class component; catches render errors anywhere below it in the tree (wraps the whole app in `_app.tsx`) and renders a plain "Oops, something went wrong!" heading instead of crashing. Logs the error/errorInfo to the console.         |
| `ErrorContent`  | Shared body for `404`/`500`: heading + message + a "Shamrock button" that routes home.                                                                                                                                                   |
| `Logo`          | 40×40 `next/image` of `ouwl.png`, wrapped in a tooltip, linking home.                                                                                                                                                                    |
| `WaveWrapper`   | Renders one of the four wave SVGs (`content-top`, `content-bottom`, `footer-top`, `footer-bottom`) from `public/images/waves` as a full-width background-cover image inside a flex box (10rem tall by default, overridable via `style`). |

## `experience/` — timeline primitives (used only by `/experience`)

A set of small, single-purpose components composed together in `pages/experience.tsx` to lay out each job/school entry: `Timeline`, `TimelineBox`, `TimelineContent`, `TimelineFromTo` (renders the `year.from`–`year.to` range), `TimelineHeading` (section heading with an icon, e.g. `IconBriefcase`/`IconSchool`), `TimelineInstitution` (name + optional link), `TimelineLocation`, `TimelineTitle`, and `VideoContainer` (renders an embedded YouTube iframe when a job entry defines `video`).

## `travel/` — Google Maps feature

See [Travel Feature](travel-feature.md) for the full data/behavior spec. Component summary:

| Component                                    | Role                                                                                                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MapWrapper`                                 | Top-level orchestrator: sets up the `@googlemaps/react-wrapper` `Wrapper`, lazily "drops" markers/polylines only once the map has scrolled into view (`useIntersection`, threshold 0.8), and renders `Map` with all `Marker`/`Polyline` children |
| `Map`                                        | Owns the actual `google.maps.Map` instance, applies `mapOptions()` + responsive zoom, and performs the reveal pan/zoom animation once everything has loaded                                                                                      |
| `Marker`                                     | One `google.maps.Marker`; imperatively drives the underlying Maps SDK object (drop animation, click → InfoWindow, zoom-responsive icon scaling) — renders `null`, all effects are side effects on the map                                        |
| `Polyline`                                   | One `google.maps.Polyline`, built from either literal `legs` (city-to-city arrays) or encoded `paths` (rail trips); same imperative-side-effect pattern as `Marker`                                                                              |
| `Legend` / `MarkerLegend` / `PolylineLegend` | Static color-key explaining marker/line colors and solid-vs-dotted (past vs upcoming) trips                                                                                                                                                      |
| `MapLoader` / `MapError`                     | Loading spinner / failure message passed to `Wrapper`'s `render` prop (via `useMap()`) and to `next/dynamic`'s `loading` option                                                                                                                  |

## `containers/layout`

`Layout` is the only container: a flex column with a scrollable `<main>` and the statically imported, server-rendered `Footer` beneath it.
