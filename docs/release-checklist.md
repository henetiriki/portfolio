# Release Checklist

Quick reference for shipping a change to production.

**How releases work here:** there are no version numbers, tags, or build artefacts. `package.json` is `private: true` and its `version` (`0.1.0`) is never bumped or published. A "release" is simply **a pull request squash-merged into `main`**, which Vercel's Git integration deploys to production automatically. [Project History](project-history.md) is the concise release record; the [Roadmap](roadmap.md) contains unfinished work only.

> **"Release ready check"** / **"Prepare for release"** — asking for either means: run everything under [Development](#development) and [Before Opening The PR](#before-opening-the-pr), including the [code review](#code-review) it starts with and the full [documentation sweep](#documentation-sweep) in both directions, and report what passes, what fails, and anything that needs a human decision.

## Development

- [ ] Work on a prefixed branch off `main` — `feature/`, `fix/`, `docs/` or `chore/`, then a hyphenated description (e.g. `feature/react-upgrade`). See [Branch names](../AGENTS.md#branch-names). `yarn branch:check` answers this on its own, `yarn validate` runs it first, and CI checks the pull request's head ref — so a misnamed branch fails the `Validate` job rather than reaching review, and renaming it then means reopening the pull request
- [ ] Local Node matches [.nvmrc](../.nvmrc) (`24`) and `engines.node` — run `nvm use` before validating, since a mismatched local runtime can pass checks that CI would fail
- [ ] New dependencies use the full `^major.minor.patch` range, matching every other entry in `package.json`

## Before Opening The PR

Work through [Code review](#code-review) first — it formats the tree and starts the review — then run the checks locally:

```bash
yarn validate
```

- [ ] It passes. `yarn validate` classifies the change and runs what that change can affect, cheapest first — lint, both type-checks, the generated-asset checks, the build and the browser suite are skipped on a documentation-only change and run on everything else. It prints the verdict and what it skipped. The individual scripts still exist and can be run on their own; the list is in [Development Workflow](development.md#scripts-packagejson). Coverage stays above the 95% global threshold in `jest.config.js`
- [ ] The pull request's `codecov/patch` check passes at 100%; inspect any GitHub Checks annotations rather than treating the aggregate Jest percentage as coverage of the changed lines. If the status never appears at all, the upload was dropped rather than failed — check Codecov's own state before the workflow, as [Testing](development.md#testing) describes
- [ ] `yarn docs:check-links` passes. Unlike the two checks below, it runs even on a documentation-only change — it verifies every relative Markdown link and heading anchor across the docs resolves, which is exactly what changes on a docs-only diff.
- [ ] `yarn css-vars:check` passes. CI runs this after `postinstall` as an integrity check for the generated, gitignored WebStorm stub; it is not a committed-file drift check.
- [ ] `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json` passes. The root `type-check` deliberately excludes this Web Worker project because its TypeScript libraries cannot be mixed with the application's DOM libraries.
- [ ] **`yarn build` succeeds and emits a non-empty `public/sw.js`.** There is only one production configuration — the service worker is generated whenever `NODE_ENV` is production, with no flag to set. CI runs the same build and asserts the same output, but run it locally so a failure is not first seen in CI.
- [ ] **`yarn test:e2e` passes.** Run it _after_ a build: Playwright serves the production output with `yarn start` on port 3002, and always starts that server itself rather than reusing one. It catches what jsdom cannot — layout, focus order, hydration and colour contrast — so a green Jest run is not a substitute. If a spec fails in CI rather than locally, the report is uploaded as a `playwright-report` artefact. See [Browser regression suite](development.md#browser-regression-suite).
- [ ] Any new `process.env` value is added in the Vercel dashboard, the `env` block in `next.config.js` if the client needs it, and `.env.test` as a dummy. If `next.config.js` requires it during a production build, also add a safe dummy to the CI job's `env` block because CI does not load `.env.test`; `next/jest` does load `.env.test` but does not evaluate the config's client `env` bridge ([environment-variables.md](environment-variables.md)).

### Code review

**Start this before `yarn validate`, not after.** Where it backgrounds it reads the diff while the production build and the browser suite run, and costs almost no wall clock; where it does not — which is not fully predictable — it is serial wherever it sits, and its findings are still worth more before a build has been paid for than after. `yarn validate` does not wait for it and should not be made to, but the two finishing independently is not the same as this section being done: the pull request waits for the review to report even when the checks are already green.

> Claude Code delegates this to its own bundled `code-review` skill, invoked from [`release-ready-check`](../.claude/skills/release-ready-check/SKILL.md) rather than waiting for a person to type it — see [D-260904e](decisions.md#d-260904e--start-the-code-review-from-the-release-ready-check-and-keep-it-claude-code-only). **Unlike the two sections below, there is deliberately no brief here to fall back on.** A review's criteria belong to the reviewing tool, so writing one out would invent a method this repository does not have and would drift from what the skill actually does. A tool without that skill has no equivalent step here and should say so rather than improvise one — the only step on this page that does not survive being read by another tool.

- [ ] **`yarn prettier:write` has run first.** Formatting is the one half of the tree's hygiene that is not already done by the time this runs — [`eslint-on-edit.mjs`](../scripts/eslint-on-edit.mjs) lints each code file as it is written, while `lint-staged` formats at commit time and this check normally runs before committing. An unformatted diff makes the review report what `prettier:check` catches for free a minute later.
- [ ] **A review has run against the diff and its findings have been read.** They are generic — correctness, reuse, simplification, efficiency — and know nothing of this repository's own disciplines, so this replaces neither the pass nor the sweep below.
- [ ] **Each finding is fixed or routed.** Fix what is wrong in the change at hand; anything else goes to the [Roadmap](roadmap.md) rather than a commit message, as the sweep already requires. Treat a finding as blocking only where it contradicts something this checklist demands.

### Sensitive information

Run against the diff, every time — not only when the change looks security-related. The expensive mistakes here are accidental.

> Claude Code delegates this to [`sensitive-information-pass`](../.claude/agents/sensitive-information-pass.md), a subagent holding `Glob, Grep, Read` and nothing else. It reports; it cannot edit, which is deliberate — the fix for a committed secret is rotation, and a deletion in a later commit does not remove it from history. See [D-260904d](decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit). The list below is that agent's brief and stands on its own for any tool that has no subagents.

- [ ] **Nothing secret is in the diff.** Credentials, API keys, tokens, passwords, private URLs, personal data. Real secrets belong in `.env*.local` (gitignored) and the Vercel dashboard; `.env` and `.env.test` are tracked and must hold only non-secret or dummy values.
- [ ] **Any new `NEXT_PUBLIC_*` value is intended to be public.** That prefix inlines the value into the client bundle at build time, so it ships to every visitor and is readable with view-source. Treat adding one as publishing it.
- [ ] **Any new value in the CI workflow's `env` block is intended to be public.** `ci.yml` is committed, so those values are as exposed as the rest of the repository.
- [ ] **No real personal data has been added to fixtures, tests or documentation** — other people's names, addresses, emails or photographs.
- [ ] **A new third-party host or asset URL has been considered for abuse, not just for secrecy.** Ask what an anonymous caller can do with it, not only what they can read; keep the exact assessment in the private maintainer runbook.
- [ ] If anything sensitive ever was committed, treat rotation as the fix. Removing it in a later commit does not remove it from history, and automated protections are a backstop rather than a reason to skip this check.

### Documentation sweep

Docs here describe **what exists today**, so they are part of the change, not an afterthought. Check both directions:

> Claude Code delegates the two-directional claim check to [`documentation-sweep`](../.claude/agents/documentation-sweep.md), a subagent under the same read-only restriction as the pass above — findings reach a person rather than being quietly fixed. Three bullets below are deliberately **not** delegated — recording anything changed outside git, adding newly discovered follow-ups, and writing down work agreed but not started. They take the session as their input rather than the tree, and an agent that cannot see it would report a confident nothing. See [D-260904d](decisions.md#d-260904d--delegate-the-sweep-and-the-secrets-pass-to-agents-that-cannot-edit).

- [ ] **Code → docs**: every behaviour changed in this PR is reflected in the affected doc(s) under `docs/` — no doc still describes the old behaviour
- [ ] **Docs → code**: claims in the docs you touched still hold against the implementation. Statements about automation are the usual offenders — re-read assertions about what CI runs, what hooks fire, and which files are generated, and verify them against the workflow/config rather than assuming
- [ ] Version numbers, file paths, script names and config keys quoted in docs match `package.json`, `next.config.js`, `ci.yml` and the actual tree
- [ ] Cross-links between docs still resolve, and new docs are listed in [docs/README.md](README.md)
- [ ] Root [README.md](../README.md) still accurate if the stack, scripts, or layout changed
- [ ] **Completed work has been _moved_, not copied** — anything this change finishes is added to [Project History](project-history.md) **and removed from the [Roadmap](roadmap.md)**. Per [D-260809a](decisions.md#d-260809a--separate-plans-decisions-and-history) the roadmap holds open work only, so a finished item left behind (or ticked in place as `[x]`) is a defect in the sweep. Partially completed work stays, narrowed to what actually remains.
- [ ] **Anything changed outside git is written down here.** Repository settings, the `main` ruleset, Codecov, Vercel — a settings change produces no commit, so nothing pulls this sweep along behind it the way editing a file does, and it is the class of change that reliably goes unrecorded. If a [Roadmap](roadmap.md) item asked for the setting, retire it in the same pass
- [ ] Any newly discovered follow-up is added to the [Roadmap](roadmap.md) rather than left in a commit message
- [ ] **Work agreed but not started is in the [Roadmap](roadmap.md) too.** Not just follow-ups found in the code — anything decided in discussion while this change was open. A decision that lives only in a conversation is lost the moment the branch closes, and "add it next time" reliably means never. Write it down in the branch you are already on, even when it is unrelated to the change.
- [ ] [Engineering Decisions](decisions.md) updated only when the change establishes or revises a durable technical choice

## Pull Request

- [ ] PR opened against `main`; CI (`.github/workflows/ci.yml`) is green
- [ ] The body opens with the two-question human checklist, and each question has an answer ticked. It comes from [`.github/pull_request_template.md`](../.github/pull_request_template.md), which GitHub applies automatically to a pull request raised in the web interface; an agent using `gh pr create --body-file` bypasses templates and copies it in instead — see [Opening a pull request](../AGENTS.md#opening-a-pull-request). Everything else on this page is worked through before the pull request exists; those two are there because only a person can answer them, and each offers both answers so an unticked box cannot pass for "nothing to report"
- [ ] Vercel preview deployment builds successfully
- [ ] Manual QA on the **preview URL**, not just localhost — it is the only pre-production environment where the service worker, real env vars, and prerendered output all apply together

> **CI runs three jobs.** `Classify the change` does a two-commit checkout and one `git diff`, installs nothing, and exposes whether the change is documentation-only. `Validate` and `Build & browser suite` both consume that answer and then run **concurrently** — nothing in the first feeds the second. `Validate` covers the branch-name check, `css-vars:check`, `icons:check`, lint, both type-checks, `docs:check-links`, `agent:check-config`, `prettier:check`, `test:coverage` and the Codecov upload; `Build & browser suite` covers `yarn build`, the `public/sw.js` assertion, the Playwright browser download and `test:e2e`. See [D-260816b](decisions.md#d-260816b--split-ci-into-concurrent-jobs-with-the-classification-in-its-own).
>
> **Documentation-only changes take a cheap path through CI, not a skipped one.** When a change touches only `docs/`, `*.md`, `.claude/` or `.worktreeinclude`, the whole `Build & browser suite` job is skipped by a job-level `if:`, and `Validate` skips `css-vars:check`, lint and both type-checks per step — leaving install, `prettier:check`, `test:coverage` and the coverage upload. Both jobs still report, which is what lets both be required checks on `main`: a job skipped by an `if:` reports success, while a `paths-ignore` filter would leave the requirement pending forever because a filtered-out workflow never reports at all.
>
> **The branch name is checked before anything is installed.** `Validate`'s first step after checkout runs `scripts/check-branch-name.mjs` against `github.head_ref`, so a misnamed branch fails in seconds rather than after the install. It runs on a pull request only — the checked-out ref there is the merge commit and carries no branch name, and a push to `main` has no branch to check. It is inside `Validate` rather than a job of its own precisely so it needs no ruleset change: `Validate` is already a required check. See [D-260904c](decisions.md#d-260904c--narrow-the-shell-hygiene-hook-to-shell-syntax-and-check-branch-names-in-ci).
>
> **Two steps in `Validate` are never gated, for different reasons.** `prettier:check` because `prettier .` covers the whole tree, so on a documentation-only change it is the only check that applies to what changed — `eslint` and both type-checks cover no Markdown. `test:coverage` and its upload because `codecov/patch` is a required check, and a skipped upload posts no status at all, which would leave it pending forever. Prose cannot affect Jest; the run is paid for so the requirement holds on every pull request.
>
> **The exclusions are CI's, not Vercel's, and the two lists deliberately differ.** Vercel asks whether a change can reach a visitor; CI asks whether it can affect lint, types, tests or the build. `e2e/` and `playwright.config.ts` are excluded from the deploy and **not** from CI — they are precisely the paths whose change must run the browser suite. `.gitignore` is in neither list, for the same reason on both sides.
>
> **The classification is one `git diff`, and it fails open.** `git diff --quiet HEAD^ HEAD -- . ':(exclude)docs' ':(exclude)*.md' ':(exclude).claude' ':(exclude).worktreeinclude'` — the same shape as `vercel.json`'s command with a different exclusion list. `HEAD^` is the base tip on a pull request, because the checked-out ref is the merge commit, and the previous tip on a push to `main`; the checkout is `fetch-depth: 2` so that parent exists. Any error resolving it exits non-zero, which classifies the change as not documentation-only and runs everything.
>
> **What a cheap run looks like:** `Build & browser suite` is marked skipped, `Validate` is green with its gated steps skipped, and the run summary reads _"Documentation-only change: `prettier:check` and the Jest run ran, everything else was skipped."_ As with a Vercel skip, do not read the green tick as evidence the suite passed.

## Merge & Deploy

- [ ] **Squash merge** into `main` (keeps the `Title (#NNN)` history style)
- [ ] Vercel auto-deploys `main` to production — no tag, no manual trigger, no deploy workflow
- [ ] Vercel build completes without errors — **unless the change touched only `docs/`, `*.md`, `.claude/`, `.worktreeinclude`, `e2e/` or `playwright.config.ts`**, in which case the build is skipped by design. Vercel still reports a `success` status; read its description, not just its colour

> **Changes a visitor cannot see do not deploy to production.** `vercel.json` runs `scripts/should-skip-vercel-build.sh`, which compares `HEAD^ HEAD` with its exclusion list when `VERCEL_ENV=production`. Note Vercel's inverted convention: **exit `0` skips the build, exit `1` builds** — so the command exits `0` precisely when nothing outside those paths changed.
>
> **A preview's first deployment always builds.** Once a preview branch has built, the command compares `HEAD` with `VERCEL_GIT_PREVIOUS_SHA`, Vercel's last successful deployment SHA for that branch. A later push containing only excluded paths skips, while a batched source-plus-documentation push builds because its source changes are compared with the last built preview rather than with its documentation tip's parent. This is intentionally not a merge-base comparison: Vercel's checkout is shallow and does not guarantee an `origin/main` ref or the pull request's base commit.
>
> **On `main` this is safe, and it is squash merging that makes it safe.** A squash lands the whole pull request as one commit, so `HEAD^ HEAD` always sees any source change it contained. Were rebase merging enabled, `main` would receive the individual commits instead and a documentation commit on top would skip the production deploy — the change live nowhere, reported as a green `success`. The repository allows squash merging only, and `vercel.json`'s correctness depends on that staying true.
>
> **Missing deployment state builds rather than skips.** If Vercel's system environment variables are not exposed, if the branch has no earlier successful deployment, or if the previous SHA is absent from the shallow checkout, the command exits `1`. The cost is a needless build; the alternative risk is a missed one.
>
> **What earns an exclusion** is that nothing the path changes can reach a visitor. `docs/`, `*.md` and `.claude/` are agent and human documentation; `.worktreeinclude` configures which gitignored files Claude Code copies into a worktree, which is a local development concern the deployed site never sees; `e2e/` and `playwright.config.ts` are the browser suite, which no bundle imports and no request reaches. `.gitignore` is deliberately not excluded: it decides what is in the repository at all, and therefore what the build has to work with.
>
> **The browser suite is excluded from the deploy, never from CI.** The root `tsconfig.json` includes `e2e/`, so `next build` does type-check it and a broken spec would have failed the Vercel build — a redundant safety net, not a unique one, since CI runs `type-check` and `test:e2e` on every change that touches them. CI's own [cheap path](#pull-request) deliberately does not copy this list: were it to, the suite would stop being checked at all.
>
> **What a skip actually looks like:** Vercel posts a `success` status whose description reads _"Canceled by Ignored Build Step"_, and the pull request gets a _"Skipped Deployment — Ignored"_ comment. It is easy to misread that green tick as a completed build; check the description. That deployment produces no preview URL — the pull request may still have one from an earlier push, and the comment shows only the latest verdict, so read it as "the last push was ignored" rather than "this branch never deployed". The footer's "Updated:" timestamp stays put — which is the point, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time and would otherwise move for a change no visitor can see.
>
> To force an otherwise skipped deploy, trigger it from the Vercel dashboard. The command fails open — if either comparison cannot be resolved it exits non-zero and the build proceeds, so the failure mode is a needless deploy rather than a missed one.

## After Deploy

Verify on the live site (https://www.ouwl.house):

- [ ] All five routes render: `/`, `/experience`, `/portfolio`, `/travel`, `/contact` — plus `/404`
- [ ] Travel map loads once scrolled into view (markers and polylines drop in)
- [ ] Footer's "Updated:" timestamp reflects the new build — it is computed at build time via `NEXT_PUBLIC_LAST_MODIFIED`, so a stale value means the deploy didn't rebuild
- [ ] `https://www.ouwl.house/sitemap.xml` and `/robots.txt` regenerated (`next-sitemap` runs as the second half of `yarn build` and reads `siteUrl` from `HOST`)
- [ ] `https://www.ouwl.house/llms.txt` returns the static Markdown file with a `200` response and an H1, rather than the custom 404 page
- [ ] Every content route has its own title, description, canonical, `og:url` and social title; URLs point at the real domain, not `undefined` or localhost
- [ ] Installed PWA launches with a dark splash/background in a standalone window — the manifest and every icon and splash asset it references are now asserted by the [browser suite](development.md#browser-regression-suite), so this check is about the real install experience rather than whether the files are there
- [ ] `/_offline` serves when offline, and a page visited beforehand still renders — both are now asserted by the [browser suite](development.md#browser-regression-suite) against a local build, so what is left here is confirming it on the deployed origin with a real worker update in play
- [ ] Contact form submits — ⚠️ **this sends a real email** through Gmail SMTP, so treat it as a live test, not a smoke test

## Known Gaps

Worth knowing before relying on the automation:

- **The CSS-variable stub has no committed baseline.** It is intentionally gitignored and regenerated during `postinstall`; CI's subsequent `css-vars:check` proves the current generated output matches `colors.ts`, not that a checked-in artefact is current. This is the intended model because the file exists only for local WebStorm analysis.
- **Dev and production use different bundlers.** `next dev` runs Turbopack; `next build` is pinned to webpack with `--webpack` because `@serwist/next` injects a webpack config that Next 16 refuses to build through Turbopack. Nothing automated exercises Turbopack — CI runs the one webpack production build — so a bundler-specific difference in either direction surfaces only in local dev or manual QA. See [development.md](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

**Resolved** (kept because each bit this project before):

- ~~**The no-PWA build remains manual.**~~ Obsolete as of 2026-08-14: the `WITH_PWA` flag was removed, so there is no second configuration to build. CI runs the single production build and asserts it emits `public/sw.js`.

- ~~**Production-mode QA collides with `next dev`.**~~ `next dev` now writes to `.next/dev` and `next build` to `.next`, so they no longer share prerendered output — verified by running a full production build with a dev server live and confirming it kept serving. Next 16 also takes a lockfile preventing two `next dev` (or two `next build`) instances on the same project. The old failure mode was `Cannot find module './chunks/vendor-chunks/next.js'` plus 500s on uncompiled routes, fixed with `yarn clean && yarn dev`.

## Rollback

There is no artefact to re-publish — roll back through Vercel:

1. Open the project's **Deployments** tab in the Vercel dashboard.
2. Find the last known-good production deployment.
3. **Promote to Production** (instant; serves the previous build).
4. Fix forward on a new `fix/*` branch — reverting the merge commit on `main` also works and will trigger a fresh deploy.
