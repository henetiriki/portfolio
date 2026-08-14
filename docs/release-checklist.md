# Release Checklist

Quick reference for shipping a change to production.

**How releases work here:** there are no version numbers, tags, or build artefacts. `package.json` is `private: true` and its `version` (`0.1.0`) is never bumped or published. A "release" is simply **a pull request squash-merged into `main`**, which Vercel's Git integration deploys to production automatically. [Project History](project-history.md) is the concise release record; the [Roadmap](roadmap.md) contains unfinished work only.

> **"Release ready check"** / **"Prepare for release"** — asking for either means: run everything under [Development](#development) and [Before Opening The PR](#before-opening-the-pr), including the full [documentation sweep](#documentation-sweep) in both directions, and report what passes, what fails, and anything that needs a human decision.

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
- [ ] The pull request's `codecov/patch` check passes at 100%; inspect any GitHub Checks annotations rather than treating the aggregate Jest percentage as coverage of the changed lines
- [ ] `yarn css-vars:check` passes. CI runs this after `postinstall` as an integrity check for the generated, gitignored WebStorm stub; it is not a committed-file drift check.
- [ ] `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json` passes. The root `type-check` deliberately excludes this Web Worker project because its TypeScript libraries cannot be mixed with the application's DOM libraries.
- [ ] **`yarn build` succeeds** — CI also builds this default path and asserts it emits no `public/sw.js`, but run it locally too so a failure is not first seen in CI.
- [ ] **`WITH_PWA=true yarn build` succeeds and emits a non-empty `public/sw.js`** — CI runs this production-like path and asserts the output; repeat it locally for a full release-ready check.
- [ ] **`yarn test:e2e` passes.** Run it _after_ a build: Playwright serves the production output with `yarn start` on port 3000, which the Google Maps key is restricted to. It catches what jsdom cannot — layout, focus order, hydration and colour contrast — so a green Jest run is not a substitute. If a spec fails in CI rather than locally, the report is uploaded as a `playwright-report` artefact. See [Browser regression suite](development.md#browser-regression-suite).
- [ ] Any new `process.env` value is added in the Vercel dashboard, the `env` block in `next.config.js` if the client needs it, and `.env.test` as a dummy. If `next.config.js` requires it during a production build, also add a safe dummy to the CI job's `env` block because CI does not load `.env.test`; `next/jest` does load `.env.test` but does not evaluate the config's client `env` bridge ([environment-variables.md](environment-variables.md)).

### Sensitive information

Run against the diff, every time — not only when the change looks security-related. The expensive mistakes here are accidental.

- [ ] **Nothing secret is in the diff.** Credentials, API keys, tokens, passwords, private URLs, personal data. Real secrets belong in `.env*.local` (gitignored) and the Vercel dashboard; `.env`, `.env.production` and `.env.test` are tracked and must hold only non-secret or dummy values.
- [ ] **Any new `NEXT_PUBLIC_*` value is intended to be public.** That prefix inlines the value into the client bundle at build time, so it ships to every visitor and is readable with view-source. Treat adding one as publishing it.
- [ ] **Any new value in the CI workflow's `env` block is intended to be public.** `ci.yml` is committed, so those values are as exposed as the rest of the repository.
- [ ] **No real personal data has been added to fixtures, tests or documentation** — other people's names, addresses, emails or photographs.
- [ ] **A new third-party host or asset URL has been considered for abuse, not just for secrecy.** A public URL can still be an abuse vector: the Cloudinary delivery host is necessarily public, yet it allows unsigned on-the-fly transformations that consume account credits. Ask what an anonymous caller can _do_ with the endpoint, not only what they can read.
- [ ] If anything sensitive ever _was_ committed, treat rotation as the fix. Removing it in a later commit does not remove it from history, and history is fully readable the moment the repository becomes public.

### Documentation sweep

Docs here describe **what exists today**, so they are part of the change, not an afterthought. Check both directions:

- [ ] **Code → docs**: every behaviour changed in this PR is reflected in the affected doc(s) under `docs/` — no doc still describes the old behaviour
- [ ] **Docs → code**: claims in the docs you touched still hold against the implementation. Statements about automation are the usual offenders — re-read assertions about what CI runs, what hooks fire, and which files are generated, and verify them against the workflow/config rather than assuming
- [ ] Version numbers, file paths, script names and config keys quoted in docs match `package.json`, `next.config.js`, `ci.yml` and the actual tree
- [ ] Cross-links between docs still resolve, and new docs are listed in [docs/README.md](README.md)
- [ ] Root [README.md](../README.md) still accurate if the stack, scripts, or layout changed
- [ ] **Completed work has been _moved_, not copied** — anything this change finishes is added to [Project History](project-history.md) **and removed from the [Roadmap](roadmap.md)**. Per [D001](decisions.md#d001--separate-plans-decisions-and-history) the roadmap holds open work only, so a finished item left behind (or ticked in place as `[x]`) is a defect in the sweep. Partially completed work stays, narrowed to what actually remains.
- [ ] Any newly discovered follow-up is added to the [Roadmap](roadmap.md) rather than left in a commit message
- [ ] **Work agreed but not started is in the [Roadmap](roadmap.md) too.** Not just follow-ups found in the code — anything decided in discussion while this change was open. A decision that lives only in a conversation is lost the moment the branch closes, and "add it next time" reliably means never. Write it down in the branch you are already on, even when it is unrelated to the change.
- [ ] [Engineering Decisions](decisions.md) updated only when the change establishes or revises a durable technical choice

## Pull Request

- [ ] PR opened against `main`; CI (`.github/workflows/ci.yml`) is green
- [ ] Vercel preview deployment builds successfully
- [ ] Manual QA on the **preview URL**, not just localhost — it is the only pre-production environment where `WITH_PWA=true`, real env vars, and prerendered output all apply together

## Merge & Deploy

- [ ] **Squash merge** into `main` (keeps the `Title (#NNN)` history style)
- [ ] Vercel auto-deploys `main` to production — no tag, no manual trigger, no deploy workflow
- [ ] Vercel build completes without errors — **unless the change touched only `docs/`, `*.md` or `.claude/`**, in which case the build is skipped by design. Vercel still reports a `success` status; read its description, not just its colour

> **Documentation-only changes do not deploy.** `vercel.json`'s `ignoreCommand` runs `git diff --quiet HEAD^ HEAD -- . ':(exclude)docs' ':(exclude)*.md' ':(exclude).claude'`. Note Vercel's inverted convention: **exit `0` skips the build, exit `1` builds** — so the command exits `0` precisely when nothing outside those paths changed.
>
> **What a skip actually looks like:** Vercel posts a `success` status whose description reads _"Canceled by Ignored Build Step"_, and the pull request gets a _"Skipped Deployment — Ignored"_ comment. It is easy to misread that green tick as a completed build; check the description. There is no preview URL, and the footer's "Updated:" timestamp stays put — which is the point, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time and would otherwise move for a change no visitor can see.
>
> To force a docs-only redeploy anyway, trigger it from the Vercel dashboard. The command fails open — if `HEAD^` cannot be resolved it exits non-zero and the build proceeds, so the failure mode is a needless deploy rather than a missed one.

## After Deploy

Verify on the live site (https://www.ouwl.house):

- [ ] All five routes render: `/`, `/experience`, `/portfolio`, `/travel`, `/contact` — plus `/404`
- [ ] Travel map loads once scrolled into view (markers and polylines drop in)
- [ ] Footer's "Updated:" timestamp reflects the new build — it is computed at build time via `NEXT_PUBLIC_LAST_MODIFIED`, so a stale value means the deploy didn't rebuild
- [ ] `https://www.ouwl.house/sitemap.xml` and `/robots.txt` regenerated (`next-sitemap` runs as the second half of `yarn build` and reads `siteUrl` from `HOST`)
- [ ] `https://www.ouwl.house/llms.txt` returns the static Markdown file with a `200` response and an H1, rather than the custom 404 page
- [ ] Every content route has its own title, description, canonical, `og:url` and social title; URLs point at the real domain, not `undefined` or localhost
- [ ] Installed PWA launches with a dark splash/background in a standalone window
- [ ] Service worker registers and `/_offline` serves when offline
- [ ] Contact form submits — ⚠️ **this sends a real email** through Gmail SMTP, so treat it as a live test, not a smoke test

## Known Gaps

Worth knowing before relying on the automation:

- **The CSS-variable stub has no committed baseline.** It is intentionally gitignored and regenerated during `postinstall`; CI's subsequent `css-vars:check` proves the current generated output matches `colors.ts`, not that a checked-in artefact is current. This is the intended model because the file exists only for local WebStorm analysis.
- **Dev and production use different bundlers.** `next dev` runs Turbopack; `next build` is pinned to webpack with `--webpack` because `@serwist/next` injects a webpack config that Next 16 refuses to build through Turbopack. A bundler-specific difference therefore cannot show up in local dev; CI covers both webpack configuration branches, but neither is Turbopack, so dev-only differences still surface only in manual QA. See [development.md](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

**Resolved** (kept because each bit this project before):

- ~~**The no-PWA build remains manual.**~~ CI now builds the default path alongside the PWA path, and asserts the default emits no `public/sw.js` — so the `WITH_PWA` gating itself is tested, not just that both configurations compile.

- ~~**Production-mode QA collides with `next dev`.**~~ `next dev` now writes to `.next/dev` and `next build` to `.next`, so they no longer share prerendered output — verified by running a full production build with a dev server live and confirming it kept serving. Next 16 also takes a lockfile preventing two `next dev` (or two `next build`) instances on the same project. The old failure mode was `Cannot find module './chunks/vendor-chunks/next.js'` plus 500s on uncompiled routes, fixed with `yarn clean && yarn dev`.

## Rollback

There is no artefact to re-publish — roll back through Vercel:

1. Open the project's **Deployments** tab in the Vercel dashboard.
2. Find the last known-good production deployment.
3. **Promote to Production** (instant; serves the previous build).
4. Fix forward on a new `feature/*` branch — reverting the merge commit on `main` also works and will trigger a fresh deploy.
