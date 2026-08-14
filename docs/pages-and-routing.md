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

Every content page supplies its title, route path and description to the shared `Seo` component. That single source derives the `"Page Name // Louw Swart"` title, canonical URL and matching description, Open Graph and Twitter metadata; the default social image is shared until a route provides its own. `_app.tsx` no longer contributes homepage SEO defaults, and keyword metadata is intentionally absent.

Portfolio cards use `next/image` with `fill`. Linked cards give the immediate `Anchor.imageLink` parent a full-height, positioned block containing box; the surrounding grid wrapper alone is not sufficient because `fill` positions against the image's immediate parent. Linked and unlinked images therefore keep the same card dimensions while avoiding Next's invalid-parent warning. Their `sizes` value follows the same single-, two- and three-column breakpoints as the CSS grid and accounts for the content padding/max-width, so Next does not select viewport-width files for card-width images. Cards are not preloaded: the fixed full-viewport background remains the intentional LCP preload.

## Error pages

| Route  | File                 | Notes                                                                                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/404` | `pages/404.tsx`      | Custom not-found page; sets a fixed background Instagram image id and `noindex, nofollow`                                             |
| `/500` | `pages/500.tsx`      | Custom server-error page; same pattern with a different fallback image id                                                             |
| N/A    | `pages/_offline.tsx` | Shown by Serwist's service worker when offline and a page isn't cached (production builds only — development ships no service worker) |

Both error pages reuse `Header` + `ErrorContent` (`@components/shared`) and dispatch a hard-coded `imgId` into global state on mount, since the normal `useIgImgId` fetch flow depends on a successful API round trip.

## API routes (`src/pages/api`)

| Route             | Method | Handler             | Behaviour                                                                                                                                                                                                                                                                                                               |
| ----------------- | ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/contact`    | POST   | `api/contact.ts`    | Enforces POST, request shape and field limits; validates and verifies the submission; emails the owner; then attempts a courtesy copy to the sender. Owner-delivery failures return the stable generic error array; a courtesy-copy failure is logged but remains a `200` so retrying cannot duplicate the owner email. |
| `/api/rail-trips` | GET    | `api/rail-trips.ts` | Returns the static `railTrips` fixture (`{ trips, upcomingTrips }`) as cacheable JSON (`s-maxage=86400`, one-week stale revalidation). Other methods return `405` with `Allow: GET` and are not cached.                                                                                                                 |
| `/api/img-id`     | GET    | `api/img-id.ts`     | Picks one image id without mutating the trimmed, non-empty entries from `ISTAGRAM_IMAGE_IDS` (server env var, comma-separated). The response is always private/no-store; missing configuration returns a generic `503`, and other methods return `405` with `Allow: GET`.                                               |

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

`Navigation` (`@components/nav/Navigation.tsx`) renders `menuItems` from `@fixtures/nav` (`Home`, `Experience`, `Portfolio`, `Travel`, `Contact`) as a sticky header on desktop and a full-screen `Drawer` on mobile (breakpoint: Mantine `sm`). Mobile links use 24px text, 32px horizontal padding and a 64px target. A native 44px `ActionIcon` scroll-to-top button appears when the user crosses the 10px threshold; its passive listener changes state only when that threshold flips, and `useScrollTo` uses immediate rather than smooth scrolling when reduced motion is preferred. The target is `pageTopRef`, stored in global state by `FixedBackground`. `Footer` renders the same `menuItems` as a secondary nav.
