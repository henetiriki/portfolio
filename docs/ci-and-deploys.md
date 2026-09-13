# CI & Deploys

What the automation actually does with a change once it is pushed: the three CI jobs and the cheap path a documentation-only change takes through them, the Vercel ignore step that decides whether a commit deploys at all, and the gaps in both.

The authoritative sources are [`ci.yml`](../.github/workflows/ci.yml), [`vercel.json`](../vercel.json), [`classify-change.mjs`](../scripts/classify-change.mjs) and [`should-skip-vercel-build.mjs`](../scripts/should-skip-vercel-build.mjs). This page explains why each is shaped the way it is, which none of them can say for themselves.

## Pull Request

**CI runs three jobs.** `Classify the change` does a two-commit checkout and one classification, installs nothing, and exposes whether the change is documentation-only. `Validate` and `Build & browser suite` both consume that answer and then run **concurrently** — nothing in the first feeds the second. `Validate` covers the branch-name check, `css-vars:check`, `icons:check`, lint, both type-checks, `docs:check-links`, `agent:check-config`, `prettier:check`, `test:coverage` and the Codecov upload; `Build & browser suite` covers `yarn build`, the `public/sw.js` assertion, the Playwright browser download and `test:e2e`.

**Documentation-only changes take a cheap path through CI, not a skipped one.** When a change touches only `docs/`, `*.md`, `.claude/` or `.worktreeinclude`, the whole `Build & browser suite` job is skipped by a job-level `if:`, and `Validate` skips `css-vars:check`, `icons:check`, lint and both type-checks per step. Everything else in `Validate` still runs: the install, the branch-name check, and the four ungated steps described below. Both jobs still report, which is what lets both be required checks on `main`: a job skipped by an `if:` reports success, while a `paths-ignore` filter would leave the requirement pending forever because a filtered-out workflow never reports at all.

**The branch name is checked before anything is installed.** `Validate`'s first step after checkout runs `scripts/check-branch-name.mjs` against `github.head_ref`, so a misnamed branch fails in seconds rather than after the install. It runs on a pull request only — the checked-out ref there is the merge commit and carries no branch name, and a push to `main` has no branch to check. It is inside `Validate` rather than a job of its own precisely so it needs no ruleset change: `Validate` is already a required check.

**Four steps in `Validate` are never gated, for three reasons.** `prettier:check` because `prettier .` covers the whole tree, so on a documentation-only change it is the only source-shaped check that applies to what changed — `eslint` and both type-checks cover no Markdown. `docs:check-links` and `agent:check-config` because each exists to check something that is itself on the documentation-only exclusion list: prose links, and the `.claude/` configuration holding the hook. A change there is precisely the case they must not skip, and neither needs build inputs — a link resolves or it does not, and the hook is a plain shell command that needs nothing built. `test:coverage` and its upload because `codecov/patch` is a required check, and a skipped upload posts no status at all, which would leave it pending forever. Prose cannot affect Jest; the run is paid for so the requirement holds on every pull request.

**The exclusions are CI's, not Vercel's, and the two lists deliberately differ.** Vercel asks whether a change can reach a visitor; CI asks whether it can affect lint, types, tests or the build. `e2e/` and `playwright*.config.ts` are excluded from the deploy and **not** from CI — they are precisely the paths whose change must run the browser suite. `.gitignore` is in neither list, for the same reason on both sides.

**The classification is a script rather than an inline diff, and it fails open.** `Classify the change` runs `node scripts/classify-change.mjs --base HEAD^ --explain`, and the exclusion list lives in that script rather than in the workflow, so `yarn validate` answers the same question the same way locally. It is no longer the shape of `vercel.json`'s command — that's the difference worth keeping straight: the deploy gate is still a `git diff --quiet` over a pathspec, while this one collects `git diff --name-only` and classifies each path in turn. `HEAD^` is the base tip on a pull request, because the checked-out ref is the merge commit, and the previous tip on a push to `main`; the checkout is `fetch-depth: 2` so that parent exists. An error resolving the diff is caught rather than thrown — the script reports `docs_only=false` and exits `0`, so the change classifies as not documentation-only and everything runs.

**What a cheap run looks like:** `Build & browser suite` is marked skipped, `Validate` is green with its gated steps skipped, and the run summary names the ungated steps that ran and the gated ones that did not. As with a Vercel skip, do not read the green tick as evidence the suite passed.

## Coverage

`Validate` uploads Jest's LCOV report after the local threshold passes, including on documentation-only changes because patch coverage is required. [`codecov.yml`](../codecov.yml) defines the required patch report and informational whole-project report; the former can block a merge, while the latter only reports the repository-wide change.

## Merge & Deploy

- **A pull request is squash merged** into `main`, which keeps the `Title (#NNN)` history style.
- **Vercel auto-deploys `main` to production** — no tag, no manual trigger, no deploy workflow.
- **The build is skipped by design where the change touched only documentation, the browser suite, `.github/`, `.husky/`, `scripts/` or the root tooling configs.** The authoritative list is `DEPLOYMENT_EXCLUSIONS` in [`should-skip-vercel-build.mjs`](../scripts/should-skip-vercel-build.mjs). Vercel still reports a `success` status; read its description, not just its colour.

**Changes a visitor cannot see do not deploy to production.** `vercel.json` runs `scripts/should-skip-vercel-build.mjs`, which compares `HEAD^ HEAD` with its exclusion list when `VERCEL_ENV=production`. Note Vercel's inverted convention: **exit `0` skips the build, exit `1` builds** — so the command exits `0` precisely when nothing outside those paths changed.

**A preview's first deployment always builds.** Once a preview branch has built, the command compares `HEAD` with `VERCEL_GIT_PREVIOUS_SHA`, Vercel's last successful deployment SHA for that branch. A later push containing only excluded paths skips, while a batched source-plus-documentation push builds because its source changes are compared with the last built preview rather than with its documentation tip's parent. This is intentionally not a merge-base comparison: Vercel's checkout is shallow and does not guarantee an `origin/main` ref or the pull request's base commit.

**On `main` this is safe, and it is squash merging that makes it safe.** A squash lands the whole pull request as one commit, so `HEAD^ HEAD` always sees any source change it contained. Were rebase merging enabled, `main` would receive the individual commits instead and a documentation commit on top would skip the production deploy — the change live nowhere, reported as a green `success`. The repository allows squash merging only, and `vercel.json`'s correctness depends on that staying true.

**Missing deployment state builds rather than skips.** If Vercel's system environment variables are not exposed, if the branch has no earlier successful deployment, or if the previous SHA is absent from the shallow checkout, the command exits `1`. The cost is a needless build; the alternative risk is a missed one.

**What earns an exclusion** is that nothing the path changes can reach a visitor. `docs/`, `*.md` and `.claude/` are agent and human documentation; `.worktreeinclude` configures which gitignored files Claude Code copies into a worktree, which is a local development concern the deployed site never sees; `e2e/` and `playwright*.config.ts` are the browser suite, which no bundle imports and no request reaches; `.github/`, `.husky/`, `codecov.yml`, `jest.*`, `.env.test`, `.prettier*` and `eslint.config.mjs` are the checks that run before a deploy rather than anything the deploy produces. `.gitignore` is deliberately not excluded: it decides what is in the repository at all, and therefore what the build has to work with.

**A filename is used only where no sibling can appear.** Everything that names a family — `jest.*`, `.prettier*`, `playwright*.config.ts` — is a pattern, because a filename goes stale the moment a sibling arrives: `playwright.maps-smoke.config.ts` triggered production builds from the day it was added, because the list had named `playwright.config.ts` alone.

**`scripts/` is excluded whole, `postinstall` notwithstanding.** It runs `css-vars:generate`, whose output is gitignored, never imported, and not written where `VERCEL` is set — the script returns before it parses `colors.ts`, so what that parse could throw on no longer reaches a deploy. `generate-pwa-icons.mjs` writes tracked files under `public/`, so a regeneration triggers the build through `public/` and a generator changed without one is caught by `yarn icons:check`. A generator that throws before that point — a bad import, a syntax error — still fails the Vercel install rather than the build, and would surface first on some later, unrelated deploying change; but `yarn install --immutable` is ungated in CI, so it fails there before the merge.

**The browser suite is excluded from the deploy, never from CI.** The root `tsconfig.json` includes `e2e/`, so `next build` does type-check it and a broken spec would have failed the Vercel build — a redundant safety net, not a unique one, since CI runs `type-check` and `test:e2e` on every change that touches them. CI's own [cheap path](#pull-request) deliberately does not copy this list: were it to, the suite would stop being checked at all.

**What a skip actually looks like:** Vercel posts a `success` status whose description reads _"Canceled by Ignored Build Step"_, and the pull request gets a _"Skipped Deployment — Ignored"_ comment. It is easy to misread that green tick as a completed build; check the description. That deployment produces no preview URL — the pull request may still have one from an earlier push, and the comment shows only the latest verdict, so read it as "the last push was ignored" rather than "this branch never deployed". The footer's "Updated:" timestamp stays put — which is the point, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time and would otherwise move for a change no visitor can see.

To force an otherwise skipped deploy, trigger it from the Vercel dashboard.

## Known Gaps

Worth knowing before relying on the automation:

- **The CSS-variable stub has no committed baseline to compare against.** `css-vars:check` in CI proves the current generated output matches `colors.ts`, not that a checked-in artefact is current — see [Styling & Theming](styling-theming.md#webstorm-css-variable-resolution-mantine-custom-propertiescss) for what the stub is and why it's gitignored.
- **Dev and production use different bundlers.** `next dev` runs Turbopack; `next build` is pinned to webpack with `--webpack` because `@serwist/next` injects a webpack config that Next 16 refuses to build through Turbopack. Nothing automated exercises Turbopack — CI runs the one webpack production build — so a bundler-specific difference in either direction surfaces only in local dev or manual QA. See [development.md](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

## Rollback

There is no artefact to re-publish — roll back through Vercel:

1. Open the project's **Deployments** tab in the Vercel dashboard.
2. Find the last known-good production deployment.
3. **Promote to Production** (instant; serves the previous build).
4. Fix forward on a new `fix/*` branch — reverting the merge commit on `main` also works and will trigger a fresh deploy.
