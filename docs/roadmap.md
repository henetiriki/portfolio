# Roadmap

Open work only. Completed milestones are recorded in [Project History](project-history.md), durable rationale in [Engineering Decisions](decisions.md), and current behaviour in the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-08-11.

## Testing & automation

- [ ] **Finish Codecov merge enforcement in GitHub.** CI now uploads Jest's explicit LCOV report to Codecov through short-lived GitHub OIDC authentication, with a strict 100% patch target and source-line annotations. After installing the Codecov GitHub App and obtaining the first successful pull-request report, require both `CI / Validate & build` and `codecov/patch` in the `main` branch-protection rule. The repository configuration is complete, but reporting alone does not block a merge until that external rule is enabled.

- [x] **Add an in-GitHub code-coverage viewer.** Codecov uses the same LCOV upload to provide a concise patch-only pull-request comment, the `codecov/patch` status and GitHub Checks annotations on uncovered source lines. The private-repository Developer plan's project status is intentionally disabled; Jest's existing 80% whole-project threshold remains the CI regression floor.

- [ ] **Add a small browser-level regression suite.** Keep it deliberately narrower than the Jest/RTL suite: render every content route, exercise the mobile drawer and keyboard path, check contact-form tab order and validation borders with mocked responses, and run one axe pass per page template. Playwright is the likely fit. The suite should remain cheap enough for the existing single CI job and should target browser behaviours that DOM tests have previously missed rather than duplicate page snapshots.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint@8.66` also requires TypeScript `<6.1.0`. Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime. See [D002](decisions.md#d002--track-active-lts-nodejs-releases).

## Performance, SEO & platform polish

- [ ] **Introduce a Content Security Policy.** Ship it in Report-Only first and promote it only once the reports are clean, because Maps, BotID, Vercel telemetry and remote images all need an allowlist. The deprecated `X-XSS-Protection` header has already been removed, so this is the remaining half of the security-header work.
