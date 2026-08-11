# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-11.

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

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D002](decisions.md#d002--track-active-lts-nodejs-releases).

## Performance, SEO & platform polish

- [ ] **Introduce a Content Security Policy.** Ship it in Report-Only first and promote it only once the reports are clean, because Maps, BotID, Vercel telemetry and remote images all need an allowlist. The deprecated `X-XSS-Protection` header has already been removed, so this is the remaining half of the security-header work.
