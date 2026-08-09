# PWA & SEO

## Progressive Web App

- `public/manifest.json` declares the app name ("Louw Swart // Portfolio"), matching dark `theme_color` and `background_color` values (`#080a20`, matching `black-russian`), `display: standalone`, maskable icons (192/512), and three `shortcuts` (Experience, Travel, Contact) for the OS-level app icon long-press menu. `standalone` is intentional: the portfolio benefits from an installed app window without treating ordinary page content as an immersive fullscreen experience, and the dark background avoids a white flash while the app launches. The manifest is linked from `_document.tsx` via `<link rel='manifest'>`.
- `_document.tsx` also declares a full matrix of `apple-touch-startup-image` `<link>` tags (one per iOS device size/orientation/pixel-ratio combination) pointing at pre-generated splash images in `public/images/manifest-icons/`, plus standard favicons and an `apple-touch-icon`.
- **Service worker / offline support is opt-in**, not always-on: `next.config.js` only wraps the config with [Serwist](https://serwist.pages.dev/) when `WITH_PWA=true` at build time (migrated from `next-pwa` 2026-08-07; see [D004](decisions.md#d004--keep-pwa-generation-opt-in-and-production-builds-on-webpack) for the retained rationale). Since `@serwist/next` is ESM-only, `next.config.js` exports an async function and dynamically `import()`s it only in that branch. The service worker's source lives at `service-worker/index.ts` (its own `tsconfig.json`, excluded from the root one — `webworker` and `dom` libs can't mix in one `tsc` run) and uses Serwist's `defaultCache` for next-pwa-parity runtime caching. CI type-checks that dedicated project separately, performs a production-like PWA build, and verifies that it emits a non-empty `public/sw.js` (gitignored — a build artifact, not source) with `pages/_offline.tsx` precached and served as the fallback for uncached routes while offline.
- `mobile-web-app-capable` / `apple-mobile-web-app-capable` meta tags are set unconditionally, independent of whether the service worker build is active.

## SEO / meta tags

- **Shared per-page metadata**: every content route renders `Seo` (`components/shared/Seo.tsx`) once with its title, path and description. `getSeoMetadata()` turns that one page-level source into the full title (`"{Page Name} // Louw Swart"`), canonical URL, description, Open Graph and Twitter title/URL/description/image values. This prevents inner routes from inheriting homepage social metadata during direct loads or client navigation. The shared portfolio image is the default, while the component accepts a page-specific image when one is added later.
- `_app.tsx` owns only genuinely app-wide head content: the viewport and generated font custom properties. Search and social metadata belongs to each route. Obsolete keyword metadata has been removed rather than duplicated in the shared component.
- `experience.tsx` uses one concise description for ordinary, Open Graph and Twitter metadata rather than expanding every employer and role into an oversized social preview.
- **Error pages** (`404.tsx`, `500.tsx`) set `<meta name='robots' content='noindex, nofollow'>` to keep them out of search results.
- `_document.tsx` sets a global `author`/`application-name` and links a Mastodon `rel='me'` tag (`https://mastodon.nz/@henetiriki`) for Mastodon profile verification.

## Sitemap & robots (`next-sitemap`)

- `next-sitemap.config.js` runs as part of `yarn build` (`"build": "next build --webpack && next-sitemap"`), generating `public/sitemap.xml` and `public/robots.txt` from `siteUrl: process.env.HOST`.
- `generateIndexSitemap: false` — a single flat `sitemap.xml`, no sitemap index, appropriate for a handful of routes.
- `robotsTxtOptions.policies`: blocks every Baidu spider variant (`Baiduspider`, `baiduspider`, `Baiduspider+`, `-video`, `-image`) site-wide, disallows `/static` for all other user agents, and otherwise allows everything.
- The generated `public/robots.txt` is checked into git (not gitignored, unlike `sitemap.xml`/`sw.js`) — it's committed output rather than a purely ephemeral build artifact, so a `/static` route disallow or Baidu block can be reviewed/diffed directly. This is the reason the recent "Add /static to robots.txt ignore" commit shows up as a plain file diff.

## AI-agent discovery (`llms.txt`)

- `public/llms.txt` is served directly at `/llms.txt` as a concise Markdown overview of the portfolio and its five canonical content routes. Keeping it as a static public asset avoids sending Lighthouse and other clients through the comparatively large custom 404 response.
- The file follows the emerging `llms.txt` convention with a required H1, a short blockquote summary and described links. It is a discovery aid, not an access-control or model-training permission mechanism; crawler policy remains in `robots.txt`.
- Only already-public portfolio information is included. Private contact details and anti-automation implementation details do not belong in this file.

## Bot protection (BotID)

Distinct from crawler SEO — `botid` (Vercel BotID) is used to keep automated traffic away from the contact form specifically:

- Client: `_app.tsx` renders `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />`, instrumenting that one route.
- Server: `api/contact.ts` calls `checkBotId()` once per accepted request before creating the SMTP transporter or sending either email. A rejected request never reaches the mail transport.
- This is layered with server-side form validation and a secondary anti-automation signal. The signal's identifier and detection details are intentionally omitted; no single mechanism is treated as sufficient on its own.

## Misc head-adjacent behavior

- Image preloading is restricted to `FixedBackground`, the deliberate full-viewport LCP image. Decorative wave SVGs and the 40px navigation logo use normal image loading, avoiding unnecessary high-priority requests; portfolio cards retain grid-accurate `sizes` without being preloaded.

- `next.config.js` sets a fixed set of `securityHeaders` (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `Referrer-Policy`, `X-XSS-Protection`) on every route via `headers()`. The deprecated `X-XSS-Protection` header and a staged CSP replacement are tracked in the [roadmap](roadmap.md#performance-seo--platform-polish).
- `public/scripts/hash-redirect.js`, loaded async from `_document.tsx`, redirects to `/` whenever the URL hash contains `#!` — a leftover guard against old hashbang-style URLs (e.g. from a pre-Next.js single-page app) being indexed or bookmarked.
