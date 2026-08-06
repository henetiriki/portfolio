# PWA & SEO

## Progressive Web App

- `public/manifest.json` declares the app name ("Louw Swart // Portfolio"), `theme_color` (`#080a20`, matching `blackRussian`), `display: fullscreen`, maskable icons (192/512), and three `shortcuts` (Experience, Travel, Contact) for the OS-level app icon long-press menu. Linked from `_document.tsx` via `<link rel='manifest'>`.
- `_document.tsx` also declares a full matrix of `apple-touch-startup-image` `<link>` tags (one per iOS device size/orientation/pixel-ratio combination) pointing at pre-generated splash images in `public/images/manifest-icons/`, plus standard favicons and an `apple-touch-icon`.
- **Service worker / offline support is opt-in**, not always-on: `next.config.js` only wraps the config with `next-pwa` when `WITH_PWA=true` at build time (`withoutPWA` is a no-op passthrough otherwise). When enabled, `next-pwa` emits `public/sw.js`, `public/workbox-*.js`, and `public/fallback-*.js` (all gitignored — build artifacts, not source) and `pages/_offline.tsx` is served for uncached routes while offline.
- `mobile-web-app-capable` / `apple-mobile-web-app-capable` meta tags are set unconditionally, independent of whether the service worker build is active.

## SEO / meta tags

- **Per-page `<Head>`**: every content page sets a `fullTitle('Page Name')` title (`utils/head.ts` → `"{Page Name} // Louw Swart"`), a canonical `<link>` (`{siteUrl}{path}`), and page-specific `description`/`keywords`/`twitter:description`/`og:description`. `_app.tsx` supplies the shared defaults (twitter card type, `og:type`, `og:site_name`, `og:image`, `twitter:image`, `twitter:creator`) that individual pages inherit unless overridden by a matching `key`.
- `experience.tsx` builds its `description`/`keywords` dynamically from the `jobs` fixture via `getExperienceDescription`/`getExperienceKeywords` (`@utils/experience.ts`) rather than a hard-coded string, so the meta content tracks the actual work history list.
- **Error pages** (`404.tsx`, `500.tsx`) set `<meta name='robots' content='noindex, nofollow'>` to keep them out of search results.
- `_document.tsx` sets a global `author`/`application-name` and links a Mastodon `rel='me'` tag (`https://mastodon.nz/@henetiriki`) for Mastodon profile verification.

## Sitemap & robots (`next-sitemap`)

- `next-sitemap.config.js` runs as part of `yarn build` (`"build": "next build && next-sitemap"`), generating `public/sitemap.xml` and `public/robots.txt` from `siteUrl: process.env.HOST`.
- `generateIndexSitemap: false` — a single flat `sitemap.xml`, no sitemap index, appropriate for a handful of routes.
- `robotsTxtOptions.policies`: blocks every Baidu spider variant (`Baiduspider`, `baiduspider`, `Baiduspider+`, `-video`, `-image`) site-wide, disallows `/static` for all other user agents, and otherwise allows everything.
- The generated `public/robots.txt` is checked into git (not gitignored, unlike `sitemap.xml`/`sw.js`/`workbox-*`/`fallback-*`) — it's committed output rather than a purely ephemeral build artifact, so a `/static` route disallow or Baidu block can be reviewed/diffed directly. This is the reason the recent "Add /static to robots.txt ignore" commit shows up as a plain file diff.

## Bot protection (BotID)

Distinct from crawler SEO — `botid` (Vercel BotID) is used to keep automated traffic away from the contact form specifically:

- Client: `_app.tsx` renders `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />`, instrumenting that one route.
- Server: `send.ts` calls `checkBotId()` before sending mail and rejects (intended to short-circuit; see the caveat in [Contact Feature](contact-feature.md)) if the request is classified as a bot.
- This is layered on top of, not instead of, the honeypot field + regex validation already in `server/contact/helpers.ts`.

## Misc head-adjacent behavior

- `next.config.js` sets a fixed set of `securityHeaders` (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `Referrer-Policy`, `X-XSS-Protection`) on every route via `headers()`.
- `public/scripts/hash-redirect.js`, loaded async from `_document.tsx`, redirects to `/` whenever the URL hash contains `#!` — a leftover guard against old hashbang-style URLs (e.g. from a pre-Next.js single-page app) being indexed or bookmarked.
