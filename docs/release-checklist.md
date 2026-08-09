# Release Checklist

Quick reference for shipping a change to production.

**How releases work here:** there are no version numbers, tags, or build artefacts. `package.json` is `private: true` and its `version` (`0.1.0`) is never bumped or published. A "release" is simply **a pull request squash-merged into `main`**, which Vercel's Git integration deploys to production automatically. [Project History](project-history.md) is the concise release record; the [Roadmap](roadmap.md) contains unfinished work only.

> **"Release ready check"** — asking for one means: run everything under [Development](#development) and [Before Opening The PR](#before-opening-the-pr), including the full [documentation sweep](#documentation-sweep) in both directions, and report what passes, what fails, and anything that needs a human decision.

## Development

- [ ] Work on a `feature/*` branch off `main` (e.g. `feature/react-upgrade`)
- [ ] Local Node matches [.nvmrc](../.nvmrc) (`24`) and `engines.node` — run `nvm use` before validating, since a mismatched local runtime can pass checks that CI would fail
- [ ] New dependencies use the full `^major.minor.patch` range, matching every other entry in `package.json`

## Before Opening The PR

Run the fast application checks locally in the same order as CI:

```bash
yarn eslint:check
yarn type-check
yarn prettier:check
yarn test:coverage
```

- [ ] All four pass; coverage stays above the 80% global threshold in `jest.config.js`
- [ ] `yarn css-vars:check` passes. CI runs this after `postinstall` as an integrity check for the generated, gitignored WebStorm stub; it is not a committed-file drift check.
- [ ] `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json` passes. The root `type-check` deliberately excludes this Web Worker project because its TypeScript libraries cannot be mixed with the application's DOM libraries.
- [ ] **`yarn build` succeeds** — CI runs the production PWA branch, but this plain build still covers the separate no-PWA configuration path.
- [ ] **`WITH_PWA=true yarn build` succeeds and emits a non-empty `public/sw.js`** — CI runs this production-like path and asserts the output; repeat it locally for a full release-ready check.
- [ ] Any new `process.env` value is added in the Vercel dashboard, the `env` block in `next.config.js` if the client needs it, and `.env.test` as a dummy. If `next.config.js` requires it during a production build, also add a safe dummy to the CI job's `env` block because CI does not load `.env.test`; `next/jest` does load `.env.test` but does not evaluate the config's client `env` bridge ([environment-variables.md](environment-variables.md)).

### Documentation sweep

Docs here describe **what exists today**, so they are part of the change, not an afterthought. Check both directions:

- [ ] **Code → docs**: every behaviour changed in this PR is reflected in the affected doc(s) under `docs/` — no doc still describes the old behaviour
- [ ] **Docs → code**: claims in the docs you touched still hold against the implementation. Statements about automation are the usual offenders — re-read assertions about what CI runs, what hooks fire, and which files are generated, and verify them against the workflow/config rather than assuming
- [ ] Version numbers, file paths, script names and config keys quoted in docs match `package.json`, `next.config.js`, `ci.yml` and the actual tree
- [ ] Cross-links between docs still resolve, and new docs are listed in [docs/README.md](README.md)
- [ ] Root [README.md](../README.md) still accurate if the stack, scripts, or layout changed
- [ ] [Project History](project-history.md) updated with completed milestones when the change is significant enough to retain, and any newly discovered follow-up added to the [Roadmap](roadmap.md) rather than left in a commit message
- [ ] [Engineering Decisions](decisions.md) updated only when the change establishes or revises a durable technical choice

## Pull Request

- [ ] PR opened against `main`; CI (`.github/workflows/ci.yml`) is green
- [ ] Vercel preview deployment builds successfully
- [ ] Manual QA on the **preview URL**, not just localhost — it is the only pre-production environment where `WITH_PWA=true`, real env vars, and prerendered output all apply together

## Merge & Deploy

- [ ] **Squash merge** into `main` (keeps the `Title (#NNN)` history style)
- [ ] Vercel auto-deploys `main` to production — no tag, no manual trigger, no deploy workflow
- [ ] Vercel build completes without errors

## After Deploy

Verify on the live site (https://www.ouwl.house):

- [ ] All five routes render: `/`, `/experience`, `/portfolio`, `/travel`, `/contact` — plus `/404`
- [ ] Travel map loads once scrolled into view (markers and polylines drop in)
- [ ] Footer's "Updated:" timestamp reflects the new build — it is computed at build time via `NEXT_PUBLIC_LAST_MODIFIED`, so a stale value means the deploy didn't rebuild
- [ ] `https://www.ouwl.house/sitemap.xml` and `/robots.txt` regenerated (`next-sitemap` runs as the second half of `yarn build` and reads `siteUrl` from `HOST`)
- [ ] Canonical `<link>` and `og:url` point at the real domain, not `undefined` or localhost
- [ ] Service worker registers and `/_offline` serves when offline
- [ ] Contact form submits — ⚠️ **this sends a real email** through Gmail SMTP, so treat it as a live test, not a smoke test

## Known Gaps

Worth knowing before relying on the automation:

- **The no-PWA build remains manual.** CI runs `WITH_PWA=true yarn build`, which covers the real production/Serwist/prerender path, but `next.config.js` also has a separate branch when `WITH_PWA` is unset. Run plain `yarn build` locally so that branch does not silently decay.
- **The CSS-variable stub has no committed baseline.** It is intentionally gitignored and regenerated during `postinstall`; CI's subsequent `css-vars:check` proves the current generated output matches `colors.ts`, not that a checked-in artefact is current. This is the intended model because the file exists only for local WebStorm analysis.
- **Dev and production use different bundlers.** `next dev` runs Turbopack; `next build` is pinned to webpack with `--webpack` because `@serwist/next` injects a webpack config that Next 16 refuses to build through Turbopack. A bundler-specific difference therefore cannot show up in local dev; CI's PWA build now covers the production webpack path, while the manual plain build covers its no-PWA configuration branch. See [development.md](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

**Resolved as of Next.js 16** (kept here because it bit this project repeatedly on 14 and 15):

- ~~**Production-mode QA collides with `next dev`.**~~ `next dev` now writes to `.next/dev` and `next build` to `.next`, so they no longer share prerendered output — verified by running a full production build with a dev server live and confirming it kept serving. Next 16 also takes a lockfile preventing two `next dev` (or two `next build`) instances on the same project. The old failure mode was `Cannot find module './chunks/vendor-chunks/next.js'` plus 500s on uncompiled routes, fixed with `yarn clean && yarn dev`.

## Rollback

There is no artefact to re-publish — roll back through Vercel:

1. Open the project's **Deployments** tab in the Vercel dashboard.
2. Find the last known-good production deployment.
3. **Promote to Production** (instant; serves the previous build).
4. Fix forward on a new `feature/*` branch — reverting the merge commit on `main` also works and will trigger a fresh deploy.
