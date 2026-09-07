# Release Checklist

Quick reference for shipping a change to production.

**How releases work here:** there are no version numbers, tags, or build artefacts. `package.json` is `private: true` and its `version` (`0.1.0`) is never bumped or published. A "release" is simply **a pull request squash-merged into `main`**, which Vercel's Git integration deploys to production automatically. The merged pull requests are therefore the release record, and Vercel's own deployment history is the authoritative answer to what is live; the [Roadmap](roadmap.md) contains unfinished work only.

> **"Release ready check"** / **"Prepare for release"** — asking for either means: work through [Development](#development) and the numbered sequence under [Before Opening The PR](#before-opening-the-pr) in order, including the [code review](#code-review), the [sensitive-information pass](#sensitive-information) and the full [documentation sweep](#documentation-sweep) in both directions, and report what passes, what fails, and anything that needs a human decision.

## Development

- [ ] Work on a prefixed branch off `main` — `feature/`, `fix/`, `docs/` or `chore/`, then a hyphenated description (e.g. `feature/react-upgrade`). `yarn branch:check` answers this on its own and `yarn validate` runs it first; check before pushing, because renaming a branch after the pull request exists means reopening it. See [Branch names](../AGENTS.md#branch-names)
- [ ] Local Node matches [.nvmrc](../.nvmrc) (`24`) and `engines.node` — run `nvm use` before validating, since a mismatched local runtime can pass checks that CI would fail
- [ ] New dependencies use the full `^major.minor.patch` range, matching every other entry in `package.json`

## Before Opening The PR

**The order is fixed, and the commits are part of it.** Work down the list. Steps 8 to 10 loop where a fix pulls in a path an agent has not read; everything before them happens once.

1. **Implement.**
2. **Commit** the implementation. Stage with `git add -A` — here and at every commit below — so a new file is committed rather than left untracked and invisible to the diff the agents read.
3. **Document** — the topical doc, the [Roadmap](roadmap.md), and a decision entry if the change earns one (D-260905a).
4. **Commit** the documentation. A documentation-only change has nothing to separate, so this collapses into step 2.
5. **Ask for the [code review](#code-review)**, and carry on — it runs in a session of its own and does not block step 6. Steps 8 onwards do wait for it.
6. **Run `yarn validate`.** A failure here is not a review finding and does not wait for step 7 — fix it, fold the fix into whichever commit caused it, and re-run until it passes.
7. **Read the [code review](#code-review)'s findings** when they come back — asked for at step 5, and not `yarn validate`'s output — then fix or route each, and **commit** them.
8. **Dispatch the [sensitive-information pass](#sensitive-information) and the [documentation sweep](#documentation-sweep)**, together. Both are owed once the branch's work is done rather than once a pull request exists — a branch handed back without one still owes them, and neither is triggered by anyone asking.
9. **Read both reports**, fix or route every finding, and **commit** them, together with anything agreed in conversation rather than found in the tree.
10. **Re-run `yarn validate`.** Re-dispatch an agent only where the previous step touched a path it had not read.
11. **Push, and [open the pull request](../AGENTS.md#opening-a-pull-request).**

**Four commits, not one:** implementation, documentation, the review's findings, then the agents'. Merges are squashed, so they land on `main` as a single commit — but `squash_merge_commit_message` is `COMMIT_MESSAGES`, so the four messages survive in its body. Skip a findings commit where there was nothing to fix. Why four, why documentation is separated from implementation, and why the review's findings are committed before the agents are dispatched: D-260905b.

**Two things the sequence rests on.** `git add -A` at every commit, because a committed range shows no untracked file and a new file is the likeliest place a key arrives — and at the findings commits especially, since step 10's re-dispatch condition is defined over what that commit touched, and an untracked file touches nothing. And commits made before step 6 are not guaranteed to pass `yarn validate` — `lint-staged` covers lint and formatting on what it stages, but a type error or a failing test survives into steps 2 and 4. Squash merging means within-branch bisectability buys nothing, so that is a trade rather than a regression.

**This is the shape a pull request ends in, not a prohibition on iterating.** Amend, or add a commit, and let the branch arrive at it.

- [ ] **`yarn validate` passes.** It classifies the change and runs what that change can affect, cheapest first — lint, both type-checks, the comment-length check, the generated-asset checks, the build and the browser suite are skipped on a documentation-only change and run on everything else. It prints the verdict and what it skipped. The individual scripts still exist and can be run on their own; the list is in [Development Workflow](development.md#scripts-packagejson). Coverage stays above the 95% global threshold in `jest.config.js`
- [ ] The pull request's `codecov/patch` check passes at 100%; inspect any GitHub Checks annotations rather than treating the aggregate Jest percentage as coverage of the changed lines. If the status never appears at all, the upload was dropped rather than failed — check Codecov's own state before the workflow, as [Testing](development.md#testing) describes
- [ ] `yarn docs:check-links` passes. Unlike the two checks below, it runs even on a documentation-only change — it verifies every relative Markdown link and heading anchor across the docs resolves, which is exactly what changes on a docs-only diff.
- [ ] `yarn css-vars:check` passes. CI runs this after `postinstall` as an integrity check for the generated, gitignored WebStorm stub; it is not a committed-file drift check.
- [ ] `yarn tsc --pretty --noEmit --project service-worker/tsconfig.json` passes. The root `type-check` deliberately excludes this Web Worker project because its TypeScript libraries cannot be mixed with the application's DOM libraries.
- [ ] **`yarn build` succeeds and emits a non-empty `public/sw.js`.** There is only one production configuration — the service worker is generated whenever `NODE_ENV` is production, with no flag to set. CI runs the same build and asserts the same output, but run it locally so a failure is not first seen in CI.
- [ ] **`yarn test:e2e` passes.** Run it _after_ a build: Playwright serves the production output with `yarn start` on port 3002, and always starts that server itself rather than reusing one. It catches what jsdom cannot — layout, focus order, hydration and colour contrast — so a green Jest run is not a substitute. If a spec fails in CI rather than locally, the report is uploaded as a `playwright-report` artefact. See [Browser regression suite](development.md#browser-regression-suite).
- [ ] Any new `process.env` value is added in the Vercel dashboard, the `env` block in `next.config.js` if the client needs it, and `.env.test` as a dummy. If `next.config.js` requires it during a production build, also add a safe dummy to the CI job's `env` block because CI does not load `.env.test`; `next/jest` does load `.env.test` but does not evaluate the config's client `env` bridge ([environment-variables.md](environment-variables.md)).

### Code review

**Asked for before `yarn validate`**, so its findings arrive before a build has been paid for. Nothing overlaps the two any more, so do not budget the review as free time: the wait is a human round trip, with steps 8 to 10 behind it. `yarn validate` does not wait for it and should not be made to, but the two finishing independently is not the same as this section being done: the pull request waits for the review to report even when the checks are already green.

> Claude Code asks for its bundled `code-review` skill to be run rather than invoking it from [`release-ready-check`](../.claude/skills/release-ready-check/SKILL.md), and reports the step as outstanding until the findings come back — see [the dispatch decision](decisions/2026-09-06-cap-automatic-subagent-dispatch.md). **Unlike the two sections below, there is deliberately no brief here to fall back on**: a review's criteria belong to the reviewing tool, so a tool without that skill has no equivalent step here and should say so rather than improvise one.

- [ ] **The tree is already formatted by the time this runs**, because the review reads committed work: [`eslint-on-edit.mjs`](../scripts/eslint-on-edit.mjs) lints each code file as it is written, and `lint-staged` formats what each commit stages.
- [ ] **A review has run against the diff and its findings have been read.** They are generic — correctness, reuse, simplification, efficiency — and know nothing of this repository's own disciplines, so this replaces neither the pass nor the sweep below.
- [ ] **Each finding is fixed or routed.** Fix what is wrong in the change at hand; anything else goes to the [Roadmap](roadmap.md) rather than a commit message, as the sweep already requires. Treat a finding as blocking only where it contradicts something this checklist demands.

### Sensitive information

Run against the diff, every time — not only when the change looks security-related. The expensive mistakes here are accidental.

> Claude Code delegates this to [`sensitive-information-pass`](../.claude/agents/sensitive-information-pass.md), a subagent holding `Glob, Grep, Read` and nothing else. It reports; it cannot edit, which is deliberate — the fix for a committed secret is rotation, and a deletion in a later commit does not remove it from history. See D-260904d. The list below is that agent's brief and stands on its own for any tool that has no subagents.

- [ ] **Nothing secret is in the diff.** Credentials, API keys, tokens, passwords, private URLs, personal data. Real secrets belong in `.env*.local` (gitignored) and the Vercel dashboard; `.env` and `.env.test` are tracked and must hold only non-secret or dummy values.
- [ ] **Any new `NEXT_PUBLIC_*` value is intended to be public.** That prefix inlines the value into the client bundle at build time, so it ships to every visitor and is readable with view-source. Treat adding one as publishing it.
- [ ] **Any new value in the CI workflow's `env` block is intended to be public.** `ci.yml` is committed, so those values are as exposed as the rest of the repository.
- [ ] **No real personal data has been added to fixtures, tests or documentation** — other people's names, addresses, emails or photographs.
- [ ] **Any file this change moved has been read, not just its diff.** A rename shows as a similarity index and the changed hunks only; a clean move shows just the two paths; a heavily rewritten one arrives as a delete plus an add, with the whole body as added lines. A move is when something long-committed acquires a new index and a new set of readers.
- [ ] **A new third-party host or asset URL has been considered for abuse, not just for secrecy.** Ask what an anonymous caller can do with it, not only what they can read; keep the exact assessment in the private maintainer runbook.
- [ ] If anything sensitive ever was committed, treat rotation as the fix. Removing it in a later commit does not remove it from history, and automated protections are a backstop rather than a reason to skip this check.

### Documentation sweep

Docs here describe **what exists today**, so they are part of the change, not an afterthought. Check both directions:

> Claude Code delegates the two-directional claim check to [`documentation-sweep`](../.claude/agents/documentation-sweep.md), a subagent under the same read-only restriction as the pass above — findings reach a person rather than being quietly fixed. Three bullets below are deliberately **not** delegated — recording anything changed outside git, adding newly discovered follow-ups, and writing down work agreed but not started. They take the session as their input rather than the tree, and an agent that cannot see it would report a confident nothing. See D-260904d.

- [ ] **Code → docs**: every behaviour changed in this PR is reflected wherever it is described — the affected doc(s) under `docs/`, and the comments beside the code itself. No doc and no comment still describes the old behaviour. Explanatory comments in `src/` are documentation under D-260905c, and nothing mechanical checks them for staleness
- [ ] **No doc restates what a comment already says.** The mechanism belongs at the call site and the topical doc holds only what spans files; a summary of a comment is a copy, and the copy is what drifts
- [ ] **Docs → code**: claims in the docs you touched still hold against the implementation. Statements about automation are the usual offenders — re-read assertions about what CI runs, what hooks fire, and which files are generated, and verify them against the workflow/config rather than assuming
- [ ] Version numbers, file paths, script names and config keys quoted in docs match `package.json`, `next.config.js`, `ci.yml` and the actual tree
- [ ] New docs are listed in [docs/README.md](README.md), which nothing checks
- [ ] **A revised decision supersedes rather than edits.** The new file's `Status:` names what it supersedes and the superseded file's `Status:` names it back; a merged decision whose body has been changed is a defect, not a tidy-up
- [ ] **Where prose moved between code, doc and log, every fact and every discarded alternative survives somewhere.** The deletion and the addition sit in different files and read as a fair trade, so loss here is silent and reviewing the diff alone will not surface it
- [ ] Root [README.md](../README.md) still accurate if the stack, scripts, or layout changed
- [ ] **Completed work has been _removed_ from the [Roadmap](roadmap.md)** — the merged pull request is the record that it happened, so nothing is copied anywhere first. Per D-260904h the roadmap holds open work only and nothing records completion separately, so a finished item left behind (or ticked in place as `[x]`) is a defect in the sweep. Partially completed work stays, narrowed to what actually remains.
- [ ] **Anything changed outside git is written down here.** Repository settings, the `main` ruleset, Codecov, Vercel — a settings change produces no commit, so nothing pulls this sweep along behind it the way editing a file does, and it is the class of change that reliably goes unrecorded. If a [Roadmap](roadmap.md) item asked for the setting, retire it in the same pass
- [ ] Any newly discovered follow-up is added to the [Roadmap](roadmap.md) rather than left in a commit message
- [ ] **Work agreed but not started is in the [Roadmap](roadmap.md) too.** Not just follow-ups found in the code — anything decided in discussion while this change was open. A decision that lives only in a conversation is lost the moment the branch closes, and "add it next time" reliably means never. Write it down in the branch you are already on, even when it is unrelated to the change.
- [ ] **[Engineering Decisions](decisions/README.md) updated only where the change makes a choice that would otherwise be re-litigated** — an entry that cannot name the alternative it discarded has not earned its place. See D-260905a.

## Pull Request

- [ ] PR opened against `main`; CI (`.github/workflows/ci.yml`) is green
- [ ] The body opens with the two-question human checklist, and each question has an answer ticked. It comes from [`.github/pull_request_template.md`](../.github/pull_request_template.md), which GitHub applies automatically to a pull request raised in the web interface; an agent using `gh pr create --body-file` bypasses templates and copies it in instead — see [Opening a pull request](../AGENTS.md#opening-a-pull-request). Everything else on this page is worked through before the pull request exists; those two are there because only a person can answer them, and each offers both answers so an unticked box cannot pass for "nothing to report"
- [ ] Vercel preview deployment builds successfully
- [ ] Manual QA on the **preview URL**, not just localhost — it is the only pre-production environment where the service worker, real env vars, and prerendered output all apply together

> **CI runs three jobs.** `Classify the change` does a two-commit checkout and one classification, installs nothing, and exposes whether the change is documentation-only. `Validate` and `Build & browser suite` both consume that answer and then run **concurrently** — nothing in the first feeds the second. `Validate` covers the branch-name check, `css-vars:check`, `icons:check`, `comments:check`, lint, both type-checks, `docs:check-links`, `agent:check-config`, `prettier:check`, `test:coverage` and the Codecov upload; `Build & browser suite` covers `yarn build`, the `public/sw.js` assertion, the Playwright browser download and `test:e2e`. See D-260816b.
>
> **Documentation-only changes take a cheap path through CI, not a skipped one.** When a change touches only `docs/`, `*.md`, `.claude/` or `.worktreeinclude`, the whole `Build & browser suite` job is skipped by a job-level `if:`, and `Validate` skips `css-vars:check`, `icons:check`, `comments:check`, lint and both type-checks per step. Everything else in `Validate` still runs: the install, the branch-name check, and the four ungated steps described below. Both jobs still report, which is what lets both be required checks on `main`: a job skipped by an `if:` reports success, while a `paths-ignore` filter would leave the requirement pending forever because a filtered-out workflow never reports at all.
>
> **The branch name is checked before anything is installed.** `Validate`'s first step after checkout runs `scripts/check-branch-name.mjs` against `github.head_ref`, so a misnamed branch fails in seconds rather than after the install. It runs on a pull request only — the checked-out ref there is the merge commit and carries no branch name, and a push to `main` has no branch to check. It is inside `Validate` rather than a job of its own precisely so it needs no ruleset change: `Validate` is already a required check. See D-260904c.
>
> **Four steps in `Validate` are never gated, for three reasons.** `prettier:check` because `prettier .` covers the whole tree, so on a documentation-only change it is the only source-shaped check that applies to what changed — `eslint` and both type-checks cover no Markdown. `docs:check-links` and `agent:check-config` because each exists to check something that is itself on the documentation-only exclusion list: prose links, and the `.claude/` configuration holding both hooks and the review agents' tool restriction. A change there is precisely the case they must not skip, and neither needs build inputs — a link resolves or it does not, and the hooks are Node scripts in this repository. `test:coverage` and its upload because `codecov/patch` is a required check, and a skipped upload posts no status at all, which would leave it pending forever. Prose cannot affect Jest; the run is paid for so the requirement holds on every pull request.
>
> **The exclusions are CI's, not Vercel's, and the two lists deliberately differ.** Vercel asks whether a change can reach a visitor; CI asks whether it can affect lint, types, tests or the build. `e2e/` and `playwright*.config.ts` are excluded from the deploy and **not** from CI — they are precisely the paths whose change must run the browser suite. `.gitignore` is in neither list, for the same reason on both sides.
>
> **The classification is a script rather than an inline diff, and it fails open.** `Classify the change` runs `node scripts/classify-change.mjs --base HEAD^ --explain`, and the exclusion list lives in that script rather than in the workflow, so `yarn validate` answers the same question the same way locally — see D-260904b. It is no longer the shape of `vercel.json`'s command, which is the difference that decision exists to keep: the deploy gate is still a `git diff --quiet` over a pathspec, while this one collects `git diff --name-only` and classifies each path in turn. `HEAD^` is the base tip on a pull request, because the checked-out ref is the merge commit, and the previous tip on a push to `main`; the checkout is `fetch-depth: 2` so that parent exists. An error resolving the diff is caught rather than thrown — the script reports `docs_only=false` and exits `0`, so the change classifies as not documentation-only and everything runs.
>
> **What a cheap run looks like:** `Build & browser suite` is marked skipped, `Validate` is green with its gated steps skipped, and the run summary names the ungated steps that ran and the gated ones that did not. As with a Vercel skip, do not read the green tick as evidence the suite passed.

## Merge & Deploy

- [ ] **Squash merge** into `main` (keeps the `Title (#NNN)` history style)
- [ ] Vercel auto-deploys `main` to production — no tag, no manual trigger, no deploy workflow
- [ ] Vercel build completes without errors — **unless the change touched only documentation, the browser suite, `.github/`, `.husky/`, `scripts/` or the root tooling configs**, in which case the build is skipped by design. The authoritative list is `DEPLOYMENT_EXCLUSIONS` in [`should-skip-vercel-build.sh`](../scripts/should-skip-vercel-build.sh). Vercel still reports a `success` status; read its description, not just its colour

> **Changes a visitor cannot see do not deploy to production.** `vercel.json` runs `scripts/should-skip-vercel-build.sh`, which compares `HEAD^ HEAD` with its exclusion list when `VERCEL_ENV=production`. Note Vercel's inverted convention: **exit `0` skips the build, exit `1` builds** — so the command exits `0` precisely when nothing outside those paths changed.
>
> **A preview's first deployment always builds.** Once a preview branch has built, the command compares `HEAD` with `VERCEL_GIT_PREVIOUS_SHA`, Vercel's last successful deployment SHA for that branch. A later push containing only excluded paths skips, while a batched source-plus-documentation push builds because its source changes are compared with the last built preview rather than with its documentation tip's parent. This is intentionally not a merge-base comparison: Vercel's checkout is shallow and does not guarantee an `origin/main` ref or the pull request's base commit.
>
> **On `main` this is safe, and it is squash merging that makes it safe.** A squash lands the whole pull request as one commit, so `HEAD^ HEAD` always sees any source change it contained. Were rebase merging enabled, `main` would receive the individual commits instead and a documentation commit on top would skip the production deploy — the change live nowhere, reported as a green `success`. The repository allows squash merging only, and `vercel.json`'s correctness depends on that staying true.
>
> **Missing deployment state builds rather than skips.** If Vercel's system environment variables are not exposed, if the branch has no earlier successful deployment, or if the previous SHA is absent from the shallow checkout, the command exits `1`. The cost is a needless build; the alternative risk is a missed one.
>
> **What earns an exclusion** is that nothing the path changes can reach a visitor. `docs/`, `*.md` and `.claude/` are agent and human documentation; `.worktreeinclude` configures which gitignored files Claude Code copies into a worktree, which is a local development concern the deployed site never sees; `e2e/` and `playwright*.config.ts` are the browser suite, which no bundle imports and no request reaches; `.github/`, `.husky/`, `codecov.yml`, `jest.*`, `.env.test`, `.prettier*` and `eslint.config.mjs` are the checks that run before a deploy rather than anything the deploy produces. `.gitignore` is deliberately not excluded: it decides what is in the repository at all, and therefore what the build has to work with.
>
> **A filename is used only where no sibling can appear.** Everything that names a family — `jest.*`, `.prettier*`, `playwright*.config.ts` — is a pattern, because a filename goes stale the moment a sibling arrives: `playwright.maps-smoke.config.ts` triggered production builds from the day it was added, because the list had named `playwright.config.ts` alone.
>
> **`scripts/` is excluded whole, `postinstall` notwithstanding.** It runs `css-vars:generate`, whose output is gitignored, never imported, and no longer written where `VERCEL` is set — the script returns before it parses `colors.ts`, so what that parse could throw on no longer reaches a deploy; see [the decision](decisions/2026-09-07-skip-the-webstorm-css-stub-on-vercel.md). `generate-pwa-icons.mjs` writes tracked files under `public/`, so a regeneration triggers the build through `public/` and a generator changed without one is caught by `yarn icons:check`. A generator that throws before that point — a bad import, a syntax error — still fails the Vercel install rather than the build, and would surface first on some later, unrelated deploying change; but `yarn install --immutable` is ungated in CI, so it fails there before the merge.
>
> **The browser suite is excluded from the deploy, never from CI.** The root `tsconfig.json` includes `e2e/`, so `next build` does type-check it and a broken spec would have failed the Vercel build — a redundant safety net, not a unique one, since CI runs `type-check` and `test:e2e` on every change that touches them. CI's own [cheap path](#pull-request) deliberately does not copy this list: were it to, the suite would stop being checked at all.
>
> **What a skip actually looks like:** Vercel posts a `success` status whose description reads _"Canceled by Ignored Build Step"_, and the pull request gets a _"Skipped Deployment — Ignored"_ comment. It is easy to misread that green tick as a completed build; check the description. That deployment produces no preview URL — the pull request may still have one from an earlier push, and the comment shows only the latest verdict, so read it as "the last push was ignored" rather than "this branch never deployed". The footer's "Updated:" timestamp stays put — which is the point, since `NEXT_PUBLIC_LAST_MODIFIED` is computed at build time and would otherwise move for a change no visitor can see.
>
> To force an otherwise skipped deploy, trigger it from the Vercel dashboard.

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

## Rollback

There is no artefact to re-publish — roll back through Vercel:

1. Open the project's **Deployments** tab in the Vercel dashboard.
2. Find the last known-good production deployment.
3. **Promote to Production** (instant; serves the previous build).
4. Fix forward on a new `fix/*` branch — reverting the merge commit on `main` also works and will trigger a fresh deploy.
