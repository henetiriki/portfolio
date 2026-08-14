# PWA & SEO

## Progressive Web App

- `public/manifest.json` declares the app name ("Louw Swart // Portfolio"), matching dark `theme_color` and `background_color` values (`#080a20`, matching `black-russian`), `display: standalone`, maskable icons (192/512), and three `shortcuts` (Experience, Travel, Contact) for the OS-level app icon long-press menu. `standalone` is intentional: the portfolio benefits from an installed app window without treating ordinary page content as an immersive fullscreen experience, and the dark background avoids a white flash while the app launches. The manifest is linked from `_document.tsx` via `<link rel='manifest'>`.
- `_document.tsx` also declares a full matrix of `apple-touch-startup-image` `<link>` tags (one per iOS device size/orientation/pixel-ratio combination) pointing at pre-generated splash images in `public/images/manifest-icons/`, plus standard favicons and an `apple-touch-icon`.
- **Every production build generates the service worker; development never does.** `next.config.js` wraps the config with [Serwist](https://serwist.pages.dev/) whenever `NODE_ENV` is `production` — there is no flag to set (migrated from `next-pwa` 2026-08-07; the `WITH_PWA` opt-in was removed 2026-08-14, see [D004](decisions.md#d004--generate-the-service-worker-in-every-production-build-never-in-development)). Since `@serwist/next` is ESM-only, `next.config.js` exports an async function and dynamically `import()`s it only in that branch — which also keeps a webpack config out of `next dev`, since Serwist attaches one unconditionally and Turbopack does not support it. The service worker's source lives at `service-worker/index.ts` (its own `tsconfig.json`, excluded from the root one — `webworker` and `dom` libs can't mix in one `tsc` run) and uses Serwist's `defaultCache` for next-pwa-parity runtime caching. CI type-checks that dedicated project separately, runs the production build, and verifies that it emits a non-empty `public/sw.js` (gitignored — a build artifact, not source) with `pages/_offline.tsx` precached and served as the fallback for uncached routes while offline.
- `mobile-web-app-capable` / `apple-mobile-web-app-capable` meta tags are set unconditionally, independent of whether the service worker build is active.
- **The manifest and every asset it or `_document.tsx` references are covered by the [browser regression suite](development.md#browser-regression-suite)**, including the 192/512 `purpose: any` icon pair that Chrome requires before it will offer to install. Service-worker registration is not; that half remains on the [roadmap](roadmap.md).

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

- Image preloading is restricted to `FixedBackground`, the deliberate full-viewport LCP image. The header-adjacent `content-top` wave uses `loading='eager'` because Next can identify it as LCP, but it is not preloaded; lower decorative waves and the 40px navigation logo remain lazy/normal priority. Portfolio cards retain grid-accurate `sizes` without being preloaded.

- `next.config.js` sets a fixed set of `securityHeaders` (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `Referrer-Policy`) on every route via `headers()`. `X-XSS-Protection` was deliberately removed — it is deprecated and its `1; mode=block` value was itself exploitable in legacy browsers.
- **The Content Security Policy ships alongside them as `Content-Security-Policy-Report-Only`**, built from the `contentSecurityPolicyDirectives` map in the same file so each directive reads as a list rather than one long string. Violations are posted to `/api/csp-report`, which reads the raw body (`report-uri` sends `application/csp-report`, which Next's body parser does not treat as JSON), drops extension-injected noise and logs one line per violation to the Vercel runtime logs. `img-src` is derived from `IMAGE_HOST_PROTOCOL`/`IMAGE_HOST_NAME`, so the remote image host stays in step with `images.remotePatterns` — see [Environment Variables](environment-variables.md). Why it is Report-Only, why `'unsafe-inline'` is permanent here, and why `report-to` is absent are all in [D012](decisions.md#d012--ship-the-content-security-policy-report-only-and-accept-unsafe-inline); promoting it to an enforcing header is tracked in the [roadmap](roadmap.md#performance-seo--platform-polish).
  - **A header value that Next silently drops is the failure mode to watch.** `headers()` uses `source: '/:path*'`, and Next compiles values as path-to-regexp templates when the source carries a parameter. `security-headers.spec.ts` asserts the header arrives, and that no backslash appears in it — a "fix" that escapes the colons ships literal backslashes that no browser can parse, and the page looks healthy either way.
- `public/scripts/hash-redirect.js`, loaded async from `_document.tsx`, redirects to `/` whenever the URL hash contains `#!` — a leftover guard against old hashbang-style URLs (e.g. from a pre-Next.js single-page app) being indexed or bookmarked.
