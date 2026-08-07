# Environment Variables

All values are read via `process.env`, either directly in server-only modules under `src/server/` (and API routes), or — for values client code needs — via `next.config.js`'s `env` key, which re-exposes them under `NEXT_PUBLIC_*` names. Client code then reads them as plain `process.env.NEXT_PUBLIC_*` (see e.g. `pages/index.tsx`, `FixedBackground.tsx`).

This replaced `publicRuntimeConfig`/`serverRuntimeConfig` (`next/config`) 2026-08-08 — that API is deprecated and is removed entirely in Next.js 16 (see [Roadmap](roadmap.md)). The underlying env var names (`HOST`, `IMAGE_HOST`, `GOOGLE_MAPS_API_KEY`) were deliberately left unchanged rather than renamed to `NEXT_PUBLIC_*` directly, since they're also read server-side and are already configured under those names in Vercel — `next.config.js`'s `env` block bridges them to a `NEXT_PUBLIC_*` name without requiring any hosting-platform config change. One value, `lastModified`, isn't a raw env var at all — it's computed once at config-load time from the current date — so it can only be exposed via this `env` bridge, not by renaming a `.env` entry.

Note for tests: `next/jest` loads `.env.test` directly but does **not** evaluate `next.config.js`'s `env` key (that bridging only happens in the real Next.js dev/build/start pipeline), so `.env.test` additionally defines the `NEXT_PUBLIC_*` names directly as dummy values — see the file itself.

`.env`, `.env.production`, and `.env.test` are checked into this repo and only contain non-secret host/feature-flag config (see below); `.env*.local` is gitignored for anything sensitive.

`.env.test` (added alongside the Jest setup — see [Development Workflow](development.md#testing)) holds dummy values for every var `next.config.js` reads unconditionally at module load, purely so `next/jest` can load a valid config while running tests. Next.js loads `.env.test` instead of `.env.local` whenever `NODE_ENV=test`. None of its values are real credentials.

## Committed defaults

| File              | Variable   | Value          | Purpose                                                                                       |
| ----------------- | ---------- | -------------- | --------------------------------------------------------------------------------------------- |
| `.env`            | `PROTOCOL` | (set locally)  | Used to help derive image-host / URL config for local dev                                     |
| `.env`            | `HOSTNAME` | (set locally)  | ditto                                                                                         |
| `.env`            | `HOST`     | (set locally)  | Base site URL — feeds `NEXT_PUBLIC_SITE_URL`, canonical links, and `next-sitemap`'s `siteUrl` |
| `.env.production` | `WITH_PWA` | `true`/`false` | Gates whether Serwist wraps the Next config (service worker generation)                       |

## Required at runtime (not committed — supply via `.env.local` / hosting platform env config)

### Public (re-exposed to the client as `NEXT_PUBLIC_*` via `next.config.js`'s `env` key)

| Variable              | Consumed by                                              | Purpose                                                                                                   |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `HOST`                | `next.config.js` → `env.NEXT_PUBLIC_SITE_URL`            | Canonical URL, OG/Twitter `og:url`-adjacent links, sitemap base URL                                       |
| `IMAGE_HOST`          | `next.config.js` → `env.NEXT_PUBLIC_IMAGE_HOST`          | Base URL `FixedBackground` prefixes onto the random Instagram `imgId` to build the photo URL              |
| `IMAGE_HOST_NAME`     | `next.config.js` `images.remotePatterns[0].hostname`     | Hostname Next/Image is allowed to optimize/serve images from                                              |
| `IMAGE_HOST_PATH`     | `next.config.js` `images.remotePatterns[0].pathname`     | Allowed path prefix under `IMAGE_HOST_NAME`                                                               |
| `IMAGE_HOST_PROTOCOL` | `next.config.js` `images.remotePatterns[0].protocol`     | `http`/`https` for the remote image host                                                                  |
| `GOOGLE_MAPS_API_KEY` | `next.config.js` → `env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key used by `MapWrapper`'s `Wrapper` — see [Travel Feature](travel-feature.md) |

### Server-only (read directly via `process.env` in `src/server/` and API routes)

| Variable                                                  | Consumed by                                           | Purpose                                                                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ISTAGRAM_IMAGE_IDS` _(sic — typo preserved from source)_ | `pages/api/img-id.ts`                                 | Comma-separated list of Instagram media shortcodes; one is picked at random per request to drive the rotating background photo                                  |
| `CUSTOM_APP_DOMAIN`                                       | `server/contact/helpers.ts`                           | Appended to the contact-email subject lines (`Message from {name} \| {domain}`)                                                                                 |
| `GMAIL_SENDER_EMAIL`                                      | `server/contact/helpers.ts`, `server/contact/send.ts` | The address contact-form messages are sent _to_ (the owner's inbox) and the transporter's `from` address                                                        |
| `GMAIL_APP_EMAIL`                                         | `server/contact/send.ts`                              | Gmail account used for SMTP auth (`nodemailer`'s `service: 'gmail'` transport)                                                                                  |
| `GMAIL_APP_PASSWORD`                                      | `server/contact/send.ts`                              | A Gmail **App Password** (not the account password — required because the account almost certainly has 2FA enabled for App Password generation to be available) |

### Build-only

| Variable   | Consumed by      | Purpose                                                                                                                        |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ANALYZE`  | `next.config.js` | `true` wraps the config with `@next/bundle-analyzer` for a local bundle-size report                                            |
| `WITH_PWA` | `next.config.js` | `true` wraps the config with Serwist (service worker generation); unset/`false` in normal dev to avoid stale SW caching issues |

## Not currently read from env

Botid (`botid` package) and its Vercel integration typically rely on Vercel project/environment linkage rather than an explicit key in this codebase — no `BOTID_*` variable is read directly in `src/`.
