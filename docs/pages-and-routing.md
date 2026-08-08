# Pages & Routing

Next.js **Pages Router**. Every file in `src/pages` (excluding `api/`, `_app.tsx`, `_document.tsx`) is a route.

## Content pages

| Route         | File                   | Purpose                                                                                                                              |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`           | `pages/index.tsx`      | Home/landing page: name, animated role tagline (`react-type-animation`), bio, open-source contributions list, hobbies, profile photo |
| `/experience` | `pages/experience.tsx` | Work history (`jobs`) and education (`schools`) rendered as two `Timeline` lists, sourced from `@fixtures/experience`                |
| `/portfolio`  | `pages/portfolio.tsx`  | Freelance work showcase (Squarespace client sites) as image cards, sourced from `@fixtures/portfolio`                                |
| `/travel`     | `pages/travel.tsx`     | Interactive Google Map of places visited/lived plus a legend; see [Travel Feature](travel-feature.md)                                |
| `/contact`    | `pages/contact.tsx`    | Contact form that emails the site owner; see [Contact Feature](contact-feature.md)                                                   |

Every content page follows the same `<Head>` pattern: a `fullTitle('Page Name')` title (`"Page Name // Louw Swart"`), a canonical `<link>` built from `process.env.NEXT_PUBLIC_SITE_URL`, and page-specific `description`/`keywords`/Twitter/OG meta tags keyed so Next.js can de-duplicate against `_app.tsx`'s defaults.

## Error pages

| Route  | File                 | Notes                                                                                                       |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/404` | `pages/404.tsx`      | Custom not-found page; sets a fixed background Instagram image id and `noindex, nofollow`                   |
| `/500` | `pages/500.tsx`      | Custom server-error page; same pattern with a different fallback image id                                   |
| N/A    | `pages/_offline.tsx` | Shown by Serwist's service worker when offline and a page isn't cached (only relevant when `WITH_PWA=true`) |

Both error pages reuse `Header` + `ErrorContent` (`@components/shared`) and dispatch a hard-coded `imgId` into global state on mount, since the normal `useIgImgId` fetch flow depends on a successful API round trip.

## API routes (`src/pages/api`)

| Route             | Method | Handler             | Behaviour                                                                                                                                                                                 |
| ----------------- | ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/contact`    | POST   | `api/contact.ts`    | Validates the submission, emails the owner, then emails a copy back to the sender. Returns `400` with an error-code array on validation failure, `500` on send failure, `200` on success. |
| `/api/rail-trips` | GET    | `api/rail-trips.ts` | Returns the static `railTrips` fixture (`{ trips, upcomingTrips }`) as JSON                                                                                                               |
| `/api/img-id`     | GET    | `api/img-id.ts`     | Picks and returns one random image id from `ISTAGRAM_IMAGE_IDS` (server env var, comma-separated)                                                                                         |

## Redirects (`next.config.js`)

| Source                                            | Destination                                  | Type                    | Notes                                                                                       |
| ------------------------------------------------- | -------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `/docs(/?.*)`                                     | `/`                                          | Permanent (308)         | Legacy path redirect — unrelated to this repo's local `/docs` folder, which is never served |
| `/static(/?.*)`                                   | `/`                                          | Permanent               | Legacy path redirect                                                                        |
| `/resources/images/icon.png`                      | `/images/manifest-icons/favicon-196x196.png` | Permanent               | Old asset path                                                                              |
| `/assets/images/manifesticons/eightbitme-192.png` | `/images/manifest-icons/favicon-196x196.png` | Permanent               | Old asset path                                                                              |
| `/` when `Host: meet.ouwl.house`                  | `https://meet.google.com/ydp-nsra-gbo`       | Permanent, host-matched | A vanity URL (`meet.ouwl.house`) that forwards to a personal Google Meet room               |

`robots.txt` (generated by `next-sitemap`, see [PWA & SEO](pwa-seo.md)) additionally blocks all Baidu spider variants site-wide and disallows `/static` for every user agent.

## Client-side navigation

`Navigation` (`@components/nav/Navigation.tsx`) renders `menuItems` from `@fixtures/nav` (`Home`, `Experience`, `Portfolio`, `Travel`, `Contact`) as a sticky header on desktop and a full-screen `Drawer` on mobile (breakpoint: Mantine `sm`). It also renders a "scroll to top" button once the user has scrolled past 10px, using `useScrollTo` against the `pageTopRef` stored in global state by `FixedBackground`. `Footer` renders the same `menuItems` a second time as a secondary nav.
