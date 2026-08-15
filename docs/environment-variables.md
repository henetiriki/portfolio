# Environment Variables

All values are read via `process.env`, either directly in server-only modules under `src/server/` (and API routes), or — for values client code needs — via `next.config.js`'s `env` key, which re-exposes them under `NEXT_PUBLIC_*` names. Client code then reads them as plain `process.env.NEXT_PUBLIC_*` (see e.g. `pages/index.tsx`, `FixedBackground.tsx`).

This replaced `publicRuntimeConfig`/`serverRuntimeConfig` (`next/config`) 2026-08-08 — that API was removed entirely in Next.js 16, which this project now runs (see [Project History](project-history.md#2026-08-08--react-19-and-the-mantine-styling-migration)), so the migration was a prerequisite rather than a cleanup. Source environment names are kept without a `NEXT_PUBLIC_*` prefix and `next.config.js` bridges the client-facing subset to build-time-inlined public names. One value, `lastModified`, isn't a raw env var at all — it's computed once at config-load time from the current date — so it can only be exposed via this bridge. It has two consumers, not one: the footer's "Updated:" line, and the precache revision the service worker attaches to `/_offline`, which needs a token that changes every build ([D-260815g](decisions.md#d-260815g--precache-the-_offline-document-which-the-build-manifest-omits)). The bridge reaches the worker because its bundle is a child of the same webpack compilation.

`.env` and `.env.test` are checked into this repo and hold only non-secret host config or dummy values; `.env*.local` is gitignored for anything sensitive. There is no `.env.production`: it held only `WITH_PWA=true`, and was deleted when that flag was removed on 2026-08-14.

**`.env.test`** (added alongside the Jest setup — see [Development Workflow](development.md#testing)) exists so `next/jest` can load a valid config: `next.config.js` reads several variables unconditionally at module load and validates the resulting `images.remotePatterns`. Next.js loads it instead of `.env.local` whenever `NODE_ENV=test`. It also defines the `NEXT_PUBLIC_*` names directly, because `next/jest` loads `.env` files but does **not** evaluate `next.config.js`'s `env` key — that bridging only happens in the real dev/build/start pipeline. None of its values are real credentials.

**The CI workflow mirrors the same values at job scope**, since a production-mode build does not load `.env.test`. Keep those dummy values aligned when adding any variable `next.config.js` requires at build time; never put real deployment or SMTP credentials in `ci.yml`, which is committed.

## Committed defaults

| File   | Variable   | Value                   | Purpose                                                                                       |
| ------ | ---------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `.env` | `PROTOCOL` | `https`                 | Scheme half of `HOST`                                                                         |
| `.env` | `HOSTNAME` | `www.ouwl.house`        | Host half of `HOST`                                                                           |
| `.env` | `HOST`     | `$PROTOCOL://$HOSTNAME` | Base site URL — feeds `NEXT_PUBLIC_SITE_URL`, canonical links, and `next-sitemap`'s `siteUrl` |

These are the production public origin, not local defaults: `.env.test` overrides all three for Jest, and the CI workflow and Vercel supply their own.

## Required at runtime (not committed — supply via `.env.local` / hosting platform env config)

### Public (re-exposed to the client as `NEXT_PUBLIC_*` via `next.config.js`'s `env` key)

| Variable              | Consumed by                                              | Purpose                                                                                                                       |
| --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `HOST`                | `next.config.js` → `env.NEXT_PUBLIC_SITE_URL`            | Canonical and Open Graph/Twitter URLs, social-image base URL, sitemap base URL                                                |
| `IMAGE_HOST`          | `next.config.js` → `env.NEXT_PUBLIC_IMAGE_HOST`          | Base URL `FixedBackground` prefixes onto the random Instagram `imgId` to build the photo URL                                  |
| `IMAGE_HOST_NAME`     | `next.config.js` `images.remotePatterns[0].hostname`     | Hostname Next/Image is allowed to optimize/serve images from                                                                  |
| `IMAGE_HOST_PATH`     | `next.config.js` `images.remotePatterns[0].pathname`     | Allowed path prefix under `IMAGE_HOST_NAME`                                                                                   |
| `IMAGE_HOST_PROTOCOL` | `next.config.js` `images.remotePatterns[0].protocol`     | `http`/`https` for the remote image host                                                                                      |
| `GOOGLE_MAPS_API_KEY` | `next.config.js` → `env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key used by the shared `@googlemaps/js-api-loader` setup — see [Travel Feature](travel-feature.md) |
| `GOOGLE_MAPS_MAP_ID`  | `next.config.js` → `env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`  | Public vector Map ID selecting the cloud configuration/style and renderer used by `/travel`                                   |

Unlike the API key, a Map ID is a public browser identifier rather than a credential, but this project still supplies its real value through local/deployment environment configuration. It must be available when `google.maps.Map` is constructed and selects the published cloud style associated in Google Maps Management.

### Server-only (read directly via `process.env` in `src/server/` and API routes)

| Variable                                                  | Consumed by                                           | Purpose                                                                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ISTAGRAM_IMAGE_IDS` _(sic — typo preserved from source)_ | `pages/api/img-id.ts`                                 | Comma-separated list of Instagram media shortcodes; one is picked at random per request to drive the rotating background photo                                  |
| `CUSTOM_APP_DOMAIN`                                       | `server/contact/helpers.ts`                           | Appended to the contact-email subject lines (`Message from {name} \| {domain}`)                                                                                 |
| `GMAIL_SENDER_EMAIL`                                      | `server/contact/helpers.ts`, `server/contact/send.ts` | The address contact-form messages are sent _to_ (the owner's inbox) and the transporter's `from` address                                                        |
| `GMAIL_APP_EMAIL`                                         | `server/contact/send.ts`                              | Gmail account used for SMTP auth (`nodemailer`'s `service: 'gmail'` transport)                                                                                  |
| `GMAIL_APP_PASSWORD`                                      | `server/contact/send.ts`                              | A Gmail **App Password** (not the account password — required because the account almost certainly has 2FA enabled for App Password generation to be available) |

### Build-only

| Variable  | Consumed by      | Purpose                                                                             |
| --------- | ---------------- | ----------------------------------------------------------------------------------- |
| `ANALYZE` | `next.config.js` | `true` wraps the config with `@next/bundle-analyzer` for a local bundle-size report |

## Not currently read from env

Botid (`botid` package) and its Vercel integration typically rely on Vercel project/environment linkage rather than an explicit key in this codebase — no `BOTID_*` variable is read directly in `src/`.
