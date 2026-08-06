# Environment Variables

All values are read via `process.env` in `next.config.js` (which exposes some of them to the client through `publicRuntimeConfig`) or directly in server-only modules under `src/server/`. None of the app's own env vars use the `NEXT_PUBLIC_*` convention — client-visible values are threaded through `publicRuntimeConfig` instead, which requires calling `getConfig()` from `next/config` at the point of use (see e.g. `pages/index.tsx`, `FixedBackground.tsx`).

`.env` and `.env.production` are checked into this repo and only contain non-secret host/feature-flag config (see below); `.env*.local` is gitignored for anything sensitive.

## Committed defaults

| File              | Variable   | Value          | Purpose                                                                                              |
| ----------------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `.env`            | `PROTOCOL` | (set locally)  | Used to help derive image-host / URL config for local dev                                            |
| `.env`            | `HOSTNAME` | (set locally)  | ditto                                                                                                |
| `.env`            | `HOST`     | (set locally)  | Base site URL — feeds `publicRuntimeConfig.siteUrl`, canonical links, and `next-sitemap`'s `siteUrl` |
| `.env.production` | `WITH_PWA` | `true`/`false` | Gates whether `next-pwa` wraps the Next config (service worker generation)                           |

## Required at runtime (not committed — supply via `.env.local` / hosting platform env config)

### Public (exposed to the client via `publicRuntimeConfig`)

| Variable              | Consumed by                                           | Purpose                                                                                                   |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `HOST`                | `next.config.js` → `publicRuntimeConfig.siteUrl`      | Canonical URL, OG/Twitter `og:url`-adjacent links, sitemap base URL                                       |
| `IMAGE_HOST`          | `next.config.js` → `publicRuntimeConfig.imgHost`      | Base URL `FixedBackground` prefixes onto the random Instagram `imgId` to build the photo URL              |
| `IMAGE_HOST_NAME`     | `next.config.js` `images.remotePatterns[0].hostname`  | Hostname Next/Image is allowed to optimize/serve images from                                              |
| `IMAGE_HOST_PATH`     | `next.config.js` `images.remotePatterns[0].pathname`  | Allowed path prefix under `IMAGE_HOST_NAME`                                                               |
| `IMAGE_HOST_PROTOCOL` | `next.config.js` `images.remotePatterns[0].protocol`  | `http`/`https` for the remote image host                                                                  |
| `GOOGLE_MAPS_API_KEY` | `next.config.js` → `publicRuntimeConfig.googleApiKey` | Google Maps JavaScript API key used by `MapWrapper`'s `Wrapper` — see [Travel Feature](travel-feature.md) |

### Server-only (`serverRuntimeConfig` or read directly in `src/server/`)

| Variable                                                  | Consumed by                                                                      | Purpose                                                                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ISTAGRAM_IMAGE_IDS` _(sic — typo preserved from source)_ | `next.config.js` → `serverRuntimeConfig.igImgIds`, read in `pages/api/img-id.ts` | Comma-separated list of Instagram media shortcodes; one is picked at random per request to drive the rotating background photo                                  |
| `CUSTOM_APP_DOMAIN`                                       | `server/contact/helpers.ts`                                                      | Appended to the contact-email subject lines (`Message from {name} \| {domain}`)                                                                                 |
| `GMAIL_SENDER_EMAIL`                                      | `server/contact/helpers.ts`, `server/contact/send.ts`                            | The address contact-form messages are sent _to_ (the owner's inbox) and the transporter's `from` address                                                        |
| `GMAIL_APP_EMAIL`                                         | `server/contact/send.ts`                                                         | Gmail account used for SMTP auth (`nodemailer`'s `service: 'gmail'` transport)                                                                                  |
| `GMAIL_APP_PASSWORD`                                      | `server/contact/send.ts`                                                         | A Gmail **App Password** (not the account password — required because the account almost certainly has 2FA enabled for App Password generation to be available) |

### Build-only

| Variable   | Consumed by      | Purpose                                                                                                                           |
| ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ANALYZE`  | `next.config.js` | `true` wraps the config with `@next/bundle-analyzer` for a local bundle-size report                                               |
| `WITH_PWA` | `next.config.js` | `true` wraps the config with `next-pwa` (service worker generation); unset/`false` in normal dev to avoid stale SW caching issues |

## Not currently read from env

Botid (`botid` package) and its Vercel integration typically rely on Vercel project/environment linkage rather than an explicit key in this codebase — no `BOTID_*` variable is read directly in `src/`.
