# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-13.

## Testing & automation

- [ ] **Enforce required checks on `main` — waiting on repository visibility, not on configuration.** CI uploads Jest's explicit LCOV report to Codecov through short-lived GitHub OIDC authentication, with a strict 100% patch target and source-line annotations. Reporting works; blocking does not, and cannot yet.
  - **This is not a settings toggle.** Verified 2026-08-11: both the classic branch-protection API and the newer rulesets API return `403 Upgrade to GitHub Pro or make this repository public to enable this feature`. Required status checks are unavailable for a private repository on a free personal plan, so no amount of repository configuration will enable them.
  - **Decision: make the repository public once the remaining actionable roadmap items are done**, then require both `CI / Validate & build` and `codecov/patch` on `main`. Publishing is preferred over a paid plan for a personal portfolio site whose source is not sensitive.
  - **Before publishing**, enable Cloudinary's **strict transformations** and restrict `fetch` delivery. The cloud name is unavoidably public — it appears in every delivery URL and is already inlined in the shipped client bundle — so anyone can request arbitrary on-the-fly transformations and burn transformation credits. That exposure exists today; publishing simply makes the account easier to notice. This is a billing-abuse control, not a data-exposure one.
  - **Also before publishing**, confirm the repository history carries no secrets. `.env`, `.env.production` and `.env.test` are tracked but hold only non-secret or dummy values; real credentials live in `.env*.local`, which is gitignored. That is the current state — history should still be checked rather than assumed, because publishing exposes every past commit, not just the tip.

- [ ] **Extend the browser regression suite.** The harness and its first specs have landed — see [Development Workflow](development.md#browser-regression-suite). Remaining candidates, still deliberately narrow:
  - Consider a reduced-motion pass (`prefers-reduced-motion`), since the map reveal, marker drop and smooth scrolling all branch on it. Playwright can set it per project via `use.reducedMotion`, so this is a project variant rather than new specs.
  - Consider covering the footer's own scroll-to-top control, which shares `pageTopRef` with the header's but has a separate call site.

## Framework & dependency upgrades

- [ ] **Remove the `WITH_PWA` flag so every production build generates the service worker.** Decided 2026-08-11. Production already sets `WITH_PWA=true` in `.env.production`, so the flag only ever selects between what ships and a configuration nothing deploys. Removing it cuts build complexity and roughly halves CI build time.
  - **What it touches:** `next.config.js` loses its conditional branch — the async config function exists solely so `@serwist/next`, which is ESM-only, can be dynamically imported when the flag is set, so that indirection may go too. CI drops from two builds to one, the release checklist from two build steps to one, and `.env.production`'s `WITH_PWA=true` becomes redundant.
  - **It revises [D004](decisions.md#d004--keep-pwa-generation-opt-in-and-production-builds-on-webpack)**, which established the opt-in. Update that decision rather than silently contradicting it; [PWA & SEO](pwa-seo.md) also references the gating.
  - **Three consequences that are not visible in the diff:**
    1. CI currently asserts the default build emits **no** `public/sw.js`. That assertion and the gating it tests both disappear — remove the step rather than leaving one that can no longer fail.
    2. Local `yarn build` gets slower and always writes `public/sw.js` (gitignored, so harmless, but a change in local behaviour).
    3. **The Playwright suite serves a production build via `yarn start`**, so an always-on service worker can cache across specs and cause flakiness. Set `serviceWorkers: 'block'` on the Playwright context, or cover service-worker behaviour deliberately in one spec rather than letting it leak into all of them.

- [ ] **Self-host the web fonts with `next/font/local` to make builds hermetic.** `next/font/google` downloads the font files from `fonts.gstatic.com` at build time, so every build depends on that host being reachable. On 2026-08-13 a CI build failed on exactly this (`Failed to fetch font file from https://fonts.gstatic.com/...montserrat...woff2`, retried and failed) while the Vercel build of the same commit succeeded — a runner-network problem, not a code one. It was the first such failure in the previous twelve runs, so it is transient rather than systemic, but the dependency is real and avoidable.
  - **Smaller than it looks: two files, ~72KB.** The build emits 14 `woff2` files totalling 368KB, but only two are ever fetched — the preloaded latin subsets (Montserrat 37KB, Roboto 35KB). The other twelve are unicode-range subsets a browser pulls only if a glyph demands one.
  - **Two files are provably enough for this content.** The whole of `src/` contains 13 non-ASCII characters (`ã æ é í ô ö ø ü – — ' " "`). Every one falls inside Google's `latin` unicode-range: the accented characters are all ≤ U+00FF, and the typographic dashes and quotes sit in U+2000–206F, which that range covers. The site's text is static fixtures, so there is no user-generated content that could later need a subset that was not shipped.
  - **Ship the licences with the files.** Montserrat is OFL 1.1 and Roboto is likewise openly licensed; both permit bundling _provided the licence text travels with the font_. This matters more once the repository is public — see the visibility item above.
  - **Verify rather than assume one thing:** Next currently generates size-adjusted fallbacks (`Montserrat Fallback`, `Roboto Fallback`) to limit layout shift. `next/font/local` supports this, but confirm those `@font-face` rules still appear in the built CSS rather than trusting that they carry over.
  - **Related, not a substitute:** CI builds twice, so it fetches the fonts twice per run. Removing the `WITH_PWA` flag (above) halves that exposure; only self-hosting removes it.

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D002](decisions.md#d002--track-active-lts-nodejs-releases).

## Performance, SEO & platform polish

- [ ] **Investigate the duplicated background-image request.** Every route fetches the fixed background twice through the optimiser — `_next/image?…&w=640&q=85` and again at `&w=3840&q=85` — observed on the live site. The second is a 3840px-wide render of the deliberate LCP image, which is wasteful on mobile. `FixedBackground` uses `fill` with `sizes='100vw'`, so the generated `srcset` runs to the largest configured device size and a high-DPR viewport can select it; the duplication suggests the candidate is being re-evaluated after the first pick. Worth checking whether a narrower `sizes` (or a capped `deviceSizes`) removes the second fetch without softening the image, and measuring LCP before and after rather than assuming. Not urgent: every route does this and the home page still scores near-perfect.

- [ ] **Introduce a Content Security Policy.** Ship it in Report-Only first and promote it only once the reports are clean, because Maps, BotID, Vercel telemetry and remote images all need an allowlist. The deprecated `X-XSS-Protection` header has already been removed, so this is the remaining half of the security-header work.
