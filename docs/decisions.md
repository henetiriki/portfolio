# Engineering Decisions

This log records durable choices whose rationale is useful beyond the change that introduced them. It is intentionally selective: current implementation details belong in the topical documentation, completed work belongs in [Project History](project-history.md), and unfinished work belongs in the [Roadmap](roadmap.md).

## Identifiers

Each decision is identified by the date it was decided, in the form `D-YYMMDD` plus a letter: `D-260814a`, `D-260814b`. The date is the one recorded in `**Decided:**`, never the merge date, so a rebase cannot change an identifier. The letter is always present, even when a date holds only one decision, and is the next free letter for that date at mint time — normally merge order too, though a corrected date can take one out of that order rather than renumber published identifiers, as [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar) did. Where the two disagree, the order entries appear in this file is the merge order.

To mint one: take your decision date, look for that date already in this file, and take the next free letter. Nothing needs checking against other branches, and nothing is ever renumbered.

Entries are newest first. Two branches adding a decision still collide textually at the top of the file; the resolution is to keep both, newest first, and for the same date put the later-merged one above — which is how [Project History](project-history.md) already resolves. See [D-260814d](#d-260814d--identify-decisions-by-date-rather-than-by-sequence).

## D-260815h — Promote the policy to enforcing in one step

- **Status:** Accepted
- **Decided:** 2026-08-15

The header key in `next.config.js` becomes `Content-Security-Policy`. Report-Only is retired rather than kept alongside, and the planned intermediate step — enforcing only `frame-ancestors`, `base-uri`, `form-action` and `object-src` next to a Report-Only header — is skipped.

**The intermediate step existed to hedge an unverified allowlist, and the allowlist is now verified.** Every page and every lazy path was exercised across Chromium, Firefox and Safari against the corrected policy on 2026-08-15, with the map driven until it rendered in vector mode and the YouTube embed actually played. Keeping the hedge would have meant running two headers whose reports are indistinguishable — `src/server/csp/` records neither `disposition` nor which header fired — and doing parser, log and email work to tell them apart, purely to support a state that would then be dismantled. Three deploys and a temporary feature, instead of one deploy and none.

**Sequencing was the real risk, not the allowlist.** Promotion had to follow [D-260815f](#d-260815f--cache-only-same-origin-requests-so-the-service-worker-stops-rewriting-the-policy) reaching real clients. A visitor still running the previous worker re-issues cross-origin requests from inside it, where `connect-src` decides, so enforcing while those workers were live would have blocked Maps sprites and Google Fonts for precisely the people who had used the site before. Under Report-Only the same condition was log noise. This is why the two changes ship as separate deploys, and why the `/sw.js` reports tailing off was the signal to proceed.

**`frame-ancestors 'none'` is enforced without ever having been observed.** Safari discards the directive in a report-only policy ([CSP Level 2](https://www.w3.org/TR/CSP2/#directive-frame-ancestors)), so no amount of further observation could have produced evidence for it — the message it logged on every page was the absence of evidence, not a finding. Enforcing it is safe by construction rather than by report: `X-Frame-Options: DENY` has enforced the identical rule throughout, so anything legitimate that framed the site was already broken. That header stays for the same reason.

**`report-uri` stays, and matters more than before.** An enforcing policy's violations are broken pages rather than observations, so the endpoint changes from a rollout instrument into the fastest route from "something looks wrong" to the directive and URL responsible.

**The accepted exposure is unchanged.** `'unsafe-inline'` remains permanent on `script-src` and `style-src` while BotID renders a nonce-less inline script and every page is statically prerendered ([D-260814c](#d-260814c--ship-the-content-security-policy-report-only-and-accept-unsafe-inline)). Promotion does not narrow that; it makes the host allowlists and the document directives real.

## D-260815g — Precache the `/_offline` document, which the build manifest omits

- **Status:** Accepted
- **Decided:** 2026-08-15

`service-worker/index.ts` appends `{ url: '/_offline', revision: NEXT_PUBLIC_LAST_MODIFIED }` to the precache entries rather than passing `self.__SW_MANIFEST` through unchanged. **Without it the offline fallback could never produce a response, and had not been able to for as long as it has existed.**

**The manifest contained the offline page's JavaScript chunk but not its HTML.** `@serwist/next` builds the list from two sources: webpack assets, and a glob over `public/`. A Pages Router route is prerendered to `.next/server/pages/_offline.html`, and the plugin's `exclude` drops everything under `server/` — so `/_next/static/chunks/pages/_offline-<hash>.js` was precached and the document was not. `PrecacheFallbackPlugin` answers by calling `matchPrecache('/_offline')`, which returned `undefined`, so the plugin returned `undefined` and the navigation failed with `ERR_FAILED`.

**This was a real defect, not a consequence of [D-260815f](#d-260815f--cache-only-same-origin-requests-so-the-service-worker-stops-rewriting-the-policy).** Confirmed by rebuilding against the unmodified `defaultCache` worker and re-running the new spec: it fails identically. The two changes landed together because the offline coverage added alongside the same-origin worker is what surfaced it.

**Why it went unnoticed.** The release checklist carried "`/_offline` serves when offline" as a manual check, and a manual check performed on a page that had already been visited passes on the runtime cache without the fallback ever being consulted. The failure needs an offline navigation to a route the worker has never seen — which is precisely the case a person testing their own site is least likely to produce. `e2e/service-worker.spec.ts` now covers both, and the distinction between them is the point of having two tests rather than one.

**The revision is the build timestamp**, `NEXT_PUBLIC_LAST_MODIFIED`, already computed in `next.config.js` for the footer. A precache entry with a null revision is treated as immutable, so the offline page would never update; the timestamp changes every build, which is exactly the invalidation this needs. Webpack replaces the expression with a string literal, so no `process` reference reaches the worker — verified in the built output, because a surviving reference would be a `ReferenceError` that stops the worker installing at all.

## D-260815f — Cache only same-origin requests, so the service worker stops rewriting the policy

- **Status:** Accepted
- **Decided:** 2026-08-15

`service-worker/index.ts` supplies its own two-entry `runtimeCaching` list, both entries gated on `sameOrigin`, in place of Serwist's `defaultCache`. Cross-origin requests match nothing and are never intercepted.

**The reason is Content Security Policy, not caching.** A request the worker handles is re-issued with `fetch()` from inside the worker, and a worker has no `img-src`, `style-src` or `font-src` — every fetch there is governed by `connect-src` alone. `defaultCache` ends with a `NetworkOnly` catch-all matching `/.*/i`, preceded by a `!sameOrigin` `NetworkFirst`, so **every** subresource on the site passed through the worker and was judged against `connect-src`. The per-destination directives only ever applied on a visitor's first, pre-worker load.

**This was found in production, not reasoned about.** Nine of the thirteen violation reports from the 2026-08-15 observation window carry `document-uri: /sw.js`: five Maps sprites on `maps.gstatic.com` that `img-src https://*.gstatic.com` already allows, three Google Fonts stylesheets that `style-src https://fonts.googleapis.com` already allows, and one style-table request. Each was permitted for the destination it actually had and refused for the destination the worker gave it.

**The alternative was to widen `connect-src` to the union of the other fetch directives.** Four lines, no behaviour change, and it would have worked — but it makes `connect-src` meaningless as a distinct directive, and it couples the policy to a third-party default list: any change to `defaultCache`, or any new host the Maps SDK reaches for, reopens the same gap. Removing the interception removes the class of problem.

**Doing it before promotion is what makes it cheap.** A worker change reaches returning visitors only once the new worker activates, so there is a window where clients on the old worker keep reporting these violations. Under Report-Only that is noise in the log. After promotion it would be broken pages.

**`runtimeCaching` cannot simply be dropped.** Serwist wires `fallbacks.entries` in as a `PrecacheFallbackPlugin` attached to the handlers supplied through `runtimeCaching`, and skips that step entirely when the option is absent — so an empty list means no `/_offline` page, with no error to notice. The list had to be replaced, not removed.

**Offline behaviour is unchanged, and most of what was dropped was inert here.** Page HTML is not precached — only `/_next/static/**`, `public/**` and `/_offline` are — so a visited page works offline because the same-origin `NetworkFirst` cached it in passing, and an unvisited one falls back to `/_offline`. Both survive. The discarded rules were third-party ones, which cannot make this site usable without a network: Maps requires one by definition, and the fonts were vendored in [D-260814a](#d-260814a--vendor-what-the-build-cannot-proceed-without). Of the rest, the three RSC rules never matched a Pages Router app at all, and there is no `/api/auth`, no audio and no video. The kept `/_next/image` entry is deliberate: `StaleWhileRevalidate` preserves current behaviour for `FixedBackground`'s photo, which is the deliberate LCP element.

**The cost is owning the list**, mitigated by `e2e/service-worker.spec.ts`, which now covers offline in both directions — the fallback for an unvisited route and the runtime cache for a visited one. That was previously a manual check, and it is the assertion that would catch a matcher which stops matching navigations.

## D-260815i — Wait for the Chromium fix instead of working around the Android navigation bar

- **Status:** Accepted
- **Decided:** 2026-08-15

Installed as a PWA on Android, every page shows a **white band behind the gesture bar**. Nothing changes in this repository: the manifest keeps `display: standalone`, and the band is expected to disappear on its own when Chrome stable picks up a fix already merged upstream.

**The fix landed in Chromium `main` on 2026-08-06** — [issues.chromium.org/40759522](https://issues.chromium.org/issues/40759522), commit `0a6ab4f`, behind the default-on `WebAppNavigationBarThemeColor` killswitch. Its message states the problem exactly: installed web apps coloured the status bar from the manifest theme colour "but left the Android navigation bar at the platform default", and the change reuses the theme colour for the navigation bar. **It colours that bar from `theme_color`, which this manifest already sets to `#080a20`** — so nothing here needs to change for the fixed behaviour to be correct.

**The band is datable and was not the canvas.** [#134](https://github.com/henetiriki/portfolio/pull/134) switched `display` from `fullscreen` to `standalone` in the same commit that changed `background_color` to `#080a20`; under `fullscreen` Android draws no system bars, so there was no navigation bar to mis-paint. [D-260815d](#d-260815d--paint-the-document-canvas-on-html-not-on-body) misdiagnosed it as a transparent canvas. That fix is correct on its own merits and stays, but it was never going to reach this surface — production serves `html: rgb(8, 10, 32)` and the band persisted.

**Two workarounds were built and both discarded, which is the part worth keeping.** Reverting to `fullscreen` removes the system bars entirely: one word, provably effective for four years, but it costs the clock, battery and signal permanently on a site people read rather than play, and it changes Android only — iOS ignores `display: fullscreen`. `viewport-fit=cover` draws content beneath the bars so the opaque `html` background reaches them, but needs `env(safe-area-inset-*)` on every edge-anchored element — the sticky header, the fixed scroll-to-top control, the footer's bottom band, and the full-screen mobile drawer whose close button is absolutely positioned and which could not be opened under browser automation to verify.

**A permanent workaround for a temporary defect is the wrong trade, and it was nearly made.** The revert to `fullscreen` was written, validated and ready to commit under the belief that the ticket was a stale 2021 report marked fixed long ago. It is instead ten days old. Workarounds outlive the bugs they route around, because nobody remembers to remove them — so the deciding question was not "which fixes it today" but "which leaves nothing to undo".

**How to tell it is done:** install the app on Android and confirm the region behind the gesture bar is `#080a20`. Chromium `main` reaches stable in roughly four to ten weeks depending on the branch point, so the earliest realistic check is late September 2026.

**Its identifier is out of step with its merge order, deliberately.** This decision merged in [#180](https://github.com/henetiriki/portfolio/pull/180), before `f`, `g` and `h` merged in [#181](https://github.com/henetiriki/portfolio/pull/181), so the letter that would reflect merge order is `f`. It was originally minted `D-260816a` against a date a day ahead of the work; correcting the date meant taking the next free letter rather than renumbering three published identifiers and every link into them. Its position in this file follows the merge order, not the letter — see [Identifiers](#identifiers).

## D-260815e — Generate the PWA icon and splash set from one vector master

- **Status:** Accepted
- **Decided:** 2026-08-15

Every icon and splash asset dated from October 2022 and had drifted from the app in three separate ways. All are now produced by one script from `public/images/ouwl.svg`, whose single `fill` was inverted from black to white so the artwork matches the header logo.

**The `purpose: any` collision is what produced the white disc on Android.** `manifest.json` listed two files under four entries, so `any` resolved to the `.maskable.png` pair — a black owl on an opaque white square, correct for `maskable` and wrong for `any`. Chrome builds its splash from the `any` icon drawn over `background_color`, hence a white circle on `#080a20`. The two purposes now have **separate files with deliberately different artwork**: `any` fills the frame, `maskable` keeps its artwork inside the 80%-diameter safe circle. Reusing one file for both cannot be right for both, because the padding that makes an icon safe to mask is exactly what makes it look shrunken when it is not.

**The `any` icons are opaque navy rather than transparent.** That is what makes Android's splash seamless — the icon's ground matches `background_color`, so the owl appears on an unbroken field instead of on a disc. Transparency would have re-introduced the same class of bug against a light launcher.

**`apple-icon-180.png` was a black owl on transparency, which iOS composites onto an opaque ground.** It is now navy-backed like the rest. This was never visible to anyone testing on Android.

**A `monochrome` layer is new.** Android's themed icons tint it to the user's wallpaper, so it must be a flat silhouette carried by the alpha channel — a greyscale conversion paints an opaque square instead, which is what the first attempt produced.

**The splash matrix was stale in both directions, which is the finding worth keeping.** It carried iPhone 5 and 6 Plus sizes while covering nothing newer than 2022 — no iPhone 16 Pro, Air or 17 family, no M4 iPad Pro, no iPad mini. Because `apple-touch-startup-image` matches an exact `device-width`/`device-height`/`-webkit-device-pixel-ratio` triple, a missing class means **no splash at all**, so recent hardware got nothing. Six classes were added (12 files, 42 total) with point sizes verified per device rather than extrapolated. iOS still has no manifest-driven splash — `background_color` remains an Android feature — so this matrix is unavoidable and will go stale again; the answer is that regenerating it is now a script run rather than a project.

**The owl is 35% of the short edge, applied to portrait and landscape alike.** The old set used 0.70 for portrait and 0.349 for landscape, so the same device got a logo at half scale depending on how it was held. There was no consistent prior behaviour to preserve.

## D-260815d — Paint the document canvas on `html`, not on `body`

- **Status:** Accepted
- **Decided:** 2026-08-15

The document canvas was transparent: both `html` and `body` computed to `rgba(0, 0, 0, 0)`, so it fell back to the user-agent default — white. The site only ever _looked_ dark because the nav, hero and footer each paint their own backgrounds; anywhere component content did not reach, the white canvas showed through. It is visible as overscroll bounce at either end of an ordinary browser tab, and an opaque canvas is correct on its own merits.

**Correction, 2026-08-15: this did not fix what it was written to fix.** The change was prompted by a white band behind the **Android gesture bar in the installed PWA**, and this decision claimed Chrome derives that region's colour from the document canvas. That holds for a browser tab and **not for an installed app**, whose system navigation bar the browser paints itself. The mechanism was verified in a desktop browser and generalised to a surface that was never tested. Production serves `html: rgb(8, 10, 32)` and the band survived — a checked negative result, and the reason the real cause was found only afterwards. See [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar).

**The fix has to go on `html`, and putting it on `body` would have broken the hero.** `body { background-color: transparent }` is load-bearing, not an oversight — [`FixedBackground`](styling-theming.md#globalcsss-four-rules) shows through from `position: fixed; z-index: -1`, and CSS paints a block element's own background _after_ negative-z-index descendants. The root element's background is different: it propagates to the canvas and paints beneath everything, negative z-index included. So an opaque `html` sits harmlessly behind the fixed image where an opaque `body` would cover it. The distinction is invisible in the CSS and cost a wrong first attempt to find.

**The value is the token that already equals the manifest.** `--mantine-color-black-russian-4` is `#080A20` — the same value as `theme_color`, `background_color` and the `theme-color` meta tag. Splash, canvas and browser chrome now resolve to one colour from one palette entry rather than three hand-copied hex literals.

**`viewport-fit=cover` was rejected here on reasoning that did not hold.** The stated ground was that it would pull `env(safe-area-inset-*)` handling into every page "for a problem that one declaration already solves" — but the one declaration did not solve it, so the trade was mispriced. It was later trialled and abandoned unfinished; see [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar).

## D-260815c — Give documentation-only changes a cheap CI path rather than no CI run

- **Status:** Accepted
- **Decided:** 2026-08-15

This project is deliberately documentation-heavy — the [release checklist](release-checklist.md#documentation-sweep) makes a docs sweep part of every change — so a roadmap edit was paying for a production build, a ~270 MB Playwright download and the whole browser suite. Replayed over the thirty merges to `main` up to [#175](https://github.com/henetiriki/portfolio/pull/175), **ten of them touch nothing outside `docs/`, `*.md`, `.claude/` and `.worktreeinclude`.** A third of the CI bill was buying nothing.

**A cheap path, not an absent one.** `prettier:check` runs `prettier .` across the tree, so Markdown and JSON _are_ checked, and on a documentation-only change it is the only check that applies to what changed — a blanket skip would remove the one thing still worth running. Everything else is gated: `eslint` and both type-checks cover no Markdown, `css-vars:check` reads `colors.ts`, and Jest cannot be affected by prose.

**`paths-ignore` was rejected before it was tried.** A workflow filtered out that way never reports, and a required check that never reports leaves a pull request pending forever — so it would silently break the branch protection the [roadmap](roadmap.md#testing--automation) plans. The filter is a per-step `if:` inside the job, so `CI / Validate & build` still runs and still reports success. That is the whole reason for the shape.

**The exclusion list is CI's, not Vercel's, and copying would have been the obvious mistake.** Vercel asks whether a change can reach a visitor; CI asks whether a change can affect lint, types, tests or the build. `e2e/` and `playwright.config.ts` are excluded from the deploy ([D-260815a](#d-260815a--give-the-service-worker-its-own-playwright-project-rather-than-unblocking-it-everywhere)) and are precisely the paths whose change _must_ run the browser suite. Verified against real commits rather than reasoned about: replaying the classification, [#173](https://github.com/henetiriki/portfolio/pull/173) takes the full path on `e2e/` alone while Vercel skipped it, and [#166](https://github.com/henetiriki/portfolio/pull/166) takes the full path on `.gitignore` alone — which is in neither list, on both sides, because it decides what the build has to work with.

**One `git diff`, matching `vercel.json`'s shape, and it fails open.** `HEAD^` is the base tip on a pull request — the checked-out ref is the merge commit — and the previous tip on a push to `main`, so a single command covers both events; the checkout carries `fetch-depth: 2` for that parent. Any failure to resolve it exits non-zero and the change is treated as not documentation-only, so the failure mode is a needless full run rather than a missed check. The same direction `vercel.json` chose.

**One consequence is owed to whoever enables branch protection.** The cheap path skips the Jest run, so no report is uploaded and `codecov/patch` is not expected to post a status at all on a documentation-only pull request. Requiring that check on `main` would therefore reintroduce exactly the permanently-pending failure that `paths-ignore` was rejected for. Nothing is required today, so nothing is broken today.

**Resolved the same day it was raised: the Jest run and the Codecov upload go back on the cheap path when the repository is made public**, rather than dropping the requirement. Skipping them was this decision's one concession to the roadmap's original shape, written before anyone priced the run — the unit suite takes seconds locally, against a production build and a ~270 MB browser download. It is a few percent of the saving, and paying it removes the branch-protection edge case rather than betting on Codecov's behaviour with no upload. Sequenced onto the [publication item](roadmap.md#testing--automation), because that is when a required check first exists to be blocked.

## D-260815b — Email Content Security Policy violations for the observation window

- **Status:** Accepted, and deliberately temporary — delete with the Report-Only window
- **Decided:** 2026-08-15

`/api/csp-report` logs one line per violation to the Vercel runtime logs, which are a rolling buffer measured in hours to days. The promotion decision in [D-260814c](#d-260814c--ship-the-content-security-policy-report-only-and-accept-unsafe-inline) needs weeks of evidence, so the reports only exist if someone happens to look while they are still there. Emailing them, reusing the Nodemailer transport the contact form already has, makes them durable without adding a service, a dependency or a dashboard.

**It is written to be deleted, and the shape follows from that.** One directory, `src/server/csp-mail/`, one import and one call in the endpoint. Removal is deleting the directory, the import and the call; nothing else knows it exists. The contact code it borrows is untouched.

**Off unless deliberately switched on.** `CSP_VIOLATION_EMAILS` must be exactly `true`; anything else, including absent, is off. This is not a default-on feature with an escape hatch — the window opens on purpose, and previews and both test environments stay off for free. It is read at module load, so flipping it on Vercel needs a redeploy.

**The endpoint cannot be authenticated, and everything else follows from that.** Browsers post CSP reports without JavaScript, so BotID cannot sign them and no token can be required. What the endpoint accepts is therefore whatever anyone chooses to post at it, and this change turns that into outbound mail.

- **Deduplication is a noise control and must not be described as a defence.** The dedup set and the cap of 20 emails per instance are module-scope state, which survives only on a warm instance; under a flood Vercel scales out and resets both precisely when they would matter. They exist so one real page load cannot produce forty emails.
- **The defence that would work is edge rate limiting, and it is unavailable** on a Hobby plan. Accepted knowingly: cap, then log-only, with the environment toggle as the real kill switch.
- **Report fields reach a mail header, so they are sanitised rather than trusted.** Every field is collapsed to a single line and truncated before it is used, because a report carrying `\r\n` in its directive is otherwise a header-injection route. The mail is plain text, so no escaping question arises in the body either.

**The send is awaited before the `204`, which costs the endpoint about four seconds per report.** Measured 2026-08-15 against real Gmail SMTP: 4.0s, effectively all of it the TLS handshake and `AUTH` for a transport built per call. Not awaiting would be faster and wrong — Vercel can freeze the instance once the response is finished, so a detached send may never complete. Browsers fire reports and ignore the response, so nothing user-facing degrades; it is still a reason to keep the window short rather than leaving the toggle on indefinitely.

**Residual risk, accepted with the numbers in front of us.** The Workspace sender allows roughly 2,000 messages a day and is shared with the contact form, which has no separate identity available. A flood during a monitoring window could burn the day's quota and take contact delivery down until the toggle is flipped. Judged acceptable against a barely-used form, a window that only opens deliberately, and no other way to make the reports durable — the same proportionality as [D-260811b](#d-260811b--accept-the-contact-endpoints-automation-only-protection).

**Delivery to a `+csp` alias, plus a fixed `[CSP]` subject prefix**, so the mail filter can key on the recipient rather than pattern-matching a subject. Both are derived in code from `GMAIL_SENDER_EMAIL` rather than configured, which keeps the switch to one variable.

## D-260815a — Give the service worker its own Playwright project rather than unblocking it everywhere

- **Status:** Accepted
- **Decided:** 2026-08-15

Service-worker registration needed browser coverage, and the suite sets `serviceWorkers: 'block'` globally. The cheap change is to drop that line; the reason not to is that the block is load-bearing rather than incidental. An unblocked worker precaches pages, so a later spec can pass against a response an earlier spec caused to be cached — a suite that is green because it is stale, which is worse than one that is red.

The registration spec therefore runs in a third project, `service-worker-chromium`, which is the only place `serviceWorkers: 'allow'` appears. Playwright gives every test its own browser context, so the precache cannot outlive the test that created it, and no other project ever starts a worker at all. Routing is by filename via `testMatch`/`testIgnore`, the same mechanism the viewport-specific specs already use, so the run still reports zero skips.

**Two assertions, because "it registered" is not the property that matters.** A worker scoped below the origin root registers happily and controls nothing, and a worker that starts without a fetch handler serves nothing — both look like success from the registration promise alone. The spec pins the scope and script URL, waits for `navigator.serviceWorker.controller` to be set without reloading — which is what `clientsClaim` in `service-worker/index.ts` buys, and the reason a first visit is not left unhandled — and then asserts a reload is answered by the worker. That last check is made discriminating by asserting the _first_ navigation is **not** from the worker: in a fresh context nothing is registered yet, so a `fromServiceWorker()` that returned true either way would prove nothing.

**A regression here appears as a timeout, not a failed assertion.** `navigator.serviceWorker.ready` never settles when registration does not happen, so there is nothing to compare. Verified by re-running the project with `serviceWorkers: 'block'`: both tests time out rather than failing informatively. Accepted — the alternative is racing a fixed deadline against a promise that may legitimately be slow, which trades a clear failure for a flaky one.

This also retires the one Content Security Policy directive that had never been exercised. `worker-src 'self' blob:` was unreachable precisely because the suite blocked service workers, which made this a prerequisite for [promoting the policy](roadmap.md) rather than the low-priority item it had been.

## D-260814e — Let each worktree install its own dependencies

- **Status:** Accepted; supersedes the `worktree.symlinkDirectories` setting
- **Decided:** 2026-08-14

Worktrees were given `node_modules` as a symlink to the main checkout's, through `worktree.symlinkDirectories` in `.claude/settings.json`. That bought a worktree working dependencies without an install, and cost `yarn dev`: Turbopack rejects a symlink pointing outside the project root — `Symlink [project]/node_modules is invalid, it points out of the filesystem root` — and panics before serving. `yarn install` did not rescue it, because Yarn follows the symlink and installs into the main checkout.

The setting is removed and each worktree installs for itself. The trade was made on measurements rather than estimates: **about 12 seconds and roughly 950 MB per worktree** — 786 MB of `node_modules` and 181 MB of `.yarn/cache`. The install is fast despite `enableGlobalCache: false`, because Yarn's global mirror still serves the fetch step; 866 packages resolved in 357 ms with no network fetch. Disk is the only real price, and it is paid per concurrent worktree rather than per session.

Two defects disappear with it rather than being fixed:

- **The shared-state footgun.** An install run from a worktree silently rewrote the main checkout's `node_modules`, so a branch bumping `package.json` changed the dependencies underneath every other checkout.
- **`postinstall` never ran per worktree.** It generates `src/styles/mantine-custom-properties.css`, which is why `yarn css-vars:check` failed in the Content Security Policy worktree until the file was generated by hand.

**Gitignored files are the remaining gap, and they are not solved by installing.** A worktree is a fresh checkout, so `.env.local` is absent — and `next.config.js` reads `IMAGE_HOST_NAME` from it into `images.remotePatterns`, so `next dev` aborts on `Invalid input at "images.remotePatterns[0]"` before serving. [`.worktreeinclude`](../.worktreeinclude) is Claude Code's own answer: gitignore syntax, and only files that are _both_ matched and gitignored are copied, so listing `.env*.local` there commits the intent without committing the secrets. It covers the worktrees Claude Code creates, not one made by hand with `git worktree add`.

## D-260814d — Identify decisions by date rather than by sequence

- **Status:** Accepted; supersedes the `D0NN` sequence
- **Decided:** 2026-08-14

Decisions were numbered `D001`, `D002`, … in the order they were written. Branches run concurrently here and `main` is the only integration point, so two open branches would both claim the same next number, and whichever merged second had to renumber its decision _and_ repoint every inbound link — the number is part of the heading anchor, so every citation breaks with it. There were 41 such citations across 8 files at the time this was written, in `docs/`, in `src/`, in `e2e/`, in `next.config.js` and in the CI workflow.

Identifiers are now derived from the decision date, which is a fact about the decision rather than a fact about the queue it happened to join. Two branches cannot collide on it, because neither is choosing a value the other might also choose.

**Sub-day precision is not optional.** Three decisions were taken on 2026-08-14, so a date-only scheme would have collided on the day it was adopted. The letter suffix is therefore always written, including for a date holding one decision — a scheme where the suffix appears only on collision would force the first decision on a date to be renamed by the second, which is the cost being removed.

`D-260814a` was preferred over a timestamp such as `D2608141830` for staying quotable: these identifiers are read aloud and typed into conversation far more often than they are sorted.

**This removes the expensive half of the conflict, not the conflict.** Two branches appending to this file still collide textually. What changes is the resolution: previously "renumber, then grep the whole repository for inbound links", now "keep both, newest first".

## D-260814c — Ship the Content Security Policy Report-Only, and accept `unsafe-inline`

- **Status:** Accepted
- **Decided:** 2026-08-14

The policy in `next.config.js` ships as `Content-Security-Policy-Report-Only`, with violations posted to `/api/csp-report` and logged. Promotion to an enforcing header is a separate, deliberate decision — the browser suite asserts the enforcing header is _absent_ so it cannot happen by accident.

**`script-src` and `style-src` both carry `'unsafe-inline'`, and that is not a temporary concession.** Two independent reasons, either of which alone would be sufficient:

- **BotID emits an inline script with no nonce hook.** `BotIdClient` renders `<script dangerouslySetInnerHTML>` with the protected-route configuration interpolated into it. The component accepts no `nonce` prop, so the only alternatives are dropping bot protection or hashing a value that changes whenever the route list does.
- **Every page is statically prerendered.** There is no `getServerSideProps` or `getStaticProps` anywhere in `src/pages`, so `_document`'s `getInitialProps` does not run per request. A nonce minted at build time is a constant, which is not a nonce. Making nonces work would mean forcing every route to render per request — a real cost to a site whose pages are otherwise static, to protect against inline injection on a site with no user-generated content.

What the policy still buys is worth having on its own: `frame-ancestors`, `base-uri`, `form-action` and `object-src 'none'` are unaffected by inline, and the host allowlists still block `<script src>` pointing anywhere off the list. Those are the directives the browser suite pins.

**Every non-obvious source was observed rather than assumed**, except where noted:

- `https://www.google.com` in `frame-src` is the YouTube embed's own nested frame, seen as a real Report-Only violation on `/experience`.
- `va.vercel-scripts.com` and `vitals.vercel-insights.com` are the **development** endpoints for Vercel Analytics and Speed Insights. In production both load same-origin from `/_vercel/…`, so `'self'` already covers them; the hosts are listed so local development does not generate noise that has to be re-triaged every time.
- BotID needs no host of its own. It loads its challenge from a same-origin path that `withBotId` rewrites to `api.vercel.com` server-side, so the browser only ever sees `'self'`.
- `maps.googleapis.com` is allowlisted explicitly rather than discovered, for the reason recorded when this work was planned: a client-side blocker already fails a Maps `gen_204` probe on `/travel`, and a blocked probe cannot be distinguished from our own policy blocking it.

**`report-to` is deliberately absent, and this was tested rather than reasoned about.** It is the non-deprecated successor to `report-uri`, and Chrome prefers it when both are present. Adding it alongside `Reporting-Endpoints: csp-endpoint="/api/csp-report"` stopped reports arriving altogether: the Reporting API requires an absolute endpoint URL, so the relative one was discarded, and Chrome had already stopped honouring `report-uri`. Making it absolute would mean building the URL from `HOST`, which on preview deployments points at production — preview violations would land in production logs, cross-origin, needing CORS. `report-uri` is deprecated but works today, and it is verified end to end by the browser suite. Revisit only with an absolute, per-environment URL.

**Reports from browser extensions are dropped at the endpoint.** Extensions inject scripts into every page and violate the policy constantly, and nothing in this repository can fix that. Left in, they would swamp the only signal the promotion decision is supposed to rest on.

The endpoint is unauthenticated by necessity, since browsers post reports without JavaScript. It is capped at 16 KB per request, parses defensively and only writes a log line, which is judged proportionate for a personal site — the same posture as [D-260811b](#d-260811b--accept-the-contact-endpoints-automation-only-protection).

## D-260814b — Enforce shell hygiene with a hook rather than a convention

- **Status:** Accepted
- **Decided:** 2026-08-14

[`AGENTS.md`](../AGENTS.md) has asked agents not to chain independent commands with `&&` or `;` since the permission allowlist was written, because that allowlist matches the _entire_ command string: a chained command can never match a narrow rule, so every chain becomes a permission prompt, and a chain that opens with an allowlisted command carries whatever follows it past the same review.

That instruction is advisory, and compliance proved unreliable across sessions — the rule is only as good as the model's discipline in the moment, which is exactly the kind of guarantee an instruction file cannot give. Hooks are different: the harness runs them, so a `PreToolUse` hook on `Bash` in `.claude/settings.json` refuses the command whether or not the model remembers the convention.

The check is a single `jq` program held inline in the settings file. It prints nothing when the command is clean, which the harness reads as "no opinion", and a `permissionDecision: "deny"` with a reason otherwise, which is fed back to the model so it reissues the calls separately. Inline rather than a script under `scripts/`, so there is no path resolution to get wrong in a worktree and nothing to keep in step with the settings file.

One limit is deliberate:

- **It is a textual test, not a shell parse.** A chain operator anywhere in the string is refused, including inside quotes — `find … -exec … \;` and `grep 'a;b'` are both casualties. Genuine pipelines are untouched: a single `|` is not part of the pattern.

**The cost of that limit was understated, and the correction argues for a convention rather than a smarter hook.** This originally read that parsing would save "a handful of commands a year". The casualty that actually recurs is not `find … -exec`; it is **prose**. A heredoc body is part of the command string, so a semicolon anywhere in a commit message or pull request body refuses the commit, and the messages this project asks for are long enough that one usually appears. Every new session rediscovers this the same way.

Narrowing the hook to ignore text after a `<<` marker would stay textual and need no shell grammar, and it was considered. It is rejected because the Auto-mode note below promotes this hook from an ergonomic measure to the control keeping the allow and deny lists honest — and a heredoc is precisely where an evasion would hide. The fix belongs on the other side: [`AGENTS.md`](../AGENTS.md) now requires commit messages and pull request bodies to be written to a file and passed with `-F` or `--body-file`. That is better practice regardless of the hook, for the same reason `Write` is preferred over a heredoc for file changes — it is reviewable before it runs.

The hook fails open. If `jq` is ever missing the command exits non-zero, which the harness treats as a hook error rather than a denial, and the command proceeds — the same posture as the convention it replaces, so a broken hook cannot block work.

**Adopting Auto mode on 2026-08-15 retired one of the two reasons above and promoted the other.** Two justifications were recorded: chains never match a narrow rule and so become permission prompts, and a chain opening with an allowlisted command carries whatever follows it past the same review. Auto mode does not prompt for allowlisted commands, so the first is now void — and that is the ergonomic half, not the safety half.

The second is what remains, and it is stronger without a human in the loop. The allow entries are wildcard-suffixed, so `Bash(git add *)` matches `git add . && <anything at all>` in its entirety. A prompt used to put that string in front of someone; nothing does now. Auto mode also introduces a soft-deny list, whose entries anchor at the start of the command — `Bash(vercel --prod:*)` does not fire on `echo deploying; vercel --prod`, so chaining is a deny-list evasion route as well as an allowlist one.

The hook therefore stays, and it is no longer an ergonomics measure that happens to help review. It is the control that keeps the allow and deny lists meaning what they say.

**`||` is blocked as of the same date, and why it was not blocked sooner is the instructive part.** It was left out originally because it had not appeared in practice, with a note to widen the pattern if that changed. That trigger needed an observer, and the observer was the permission prompt: a chain matching no narrow rule put its full text in front of someone. Auto mode removes that, so "if it appears" became a condition nobody is positioned to notice — while `||` launders exactly as `&&` does, matching `Bash(git add *)` in `git add . || <anything>` and slipping past a soft-deny rule that anchors at the start of the command. Waiting on a signal that no longer arrives is not a wait-and-see posture, it is the advisory convention this decision exists to replace. The pattern is now `&&|;|[|][|]`, using a character class rather than escaped pipes so there are no backslashes to get wrong across the JSON and jq layers.

**Hook changes take effect immediately, unlike the permission rules.** Verified in the session that made this one: the edited hook refused the very next command carrying `||`, with the new wording. [`AGENTS.md`](../AGENTS.md) warns that `.claude/` changes do not apply until a session restart, which holds for permission rules but not for hooks — worth knowing, because it means a broken hook takes effect immediately too.

## D-260814a — Vendor what the build cannot proceed without

- **Status:** Accepted
- **Decided:** 2026-08-14

`next/font/google` downloaded the font files from `fonts.gstatic.com` during every build, which made a successful build depend on a third-party host being reachable from whichever runner happened to be executing it. That failed a CI run on 2026-08-13 for reasons entirely unrelated to the commit being built, and the same commit built fine on Vercel minutes later. A build that can fail without anything being wrong is a build whose result cannot be trusted either way.

An asset the build cannot complete without belongs in the repository, together with whatever licence permits it to be there. The web fonts are now committed (see [Styling & Theming](styling-theming.md#fonts)); the same reasoning already applies to the vendored Yarn release under [D-260811a](#d-260811a--keep-the-package-managers-supply-chain-defaults). This is about build inputs, not runtime ones — fetching data at request time is a different question with different failure handling.

The cost is that vendored assets do not update themselves, so each carries a written refresh procedure next to it rather than an implicit "whatever the CDN serves today". Prefer that cost: a stale font is a visible, deliberate choice, while a fetch is an invisible dependency that only announces itself when it breaks.

## D-260811b — Accept the contact endpoint's automation-only protection

- **Status:** Accepted
- **Decided:** 2026-08-11

[D-260809b](#d-260809b--treat-the-contact-endpoint-as-a-stable-public-boundary) treats the contact endpoint as a stable public boundary, which makes the absence of request-rate limiting worth stating rather than leaving as an unexamined gap.

Protection is deliberately automation-focused: bot verification plus a secondary signal, bounded field limits and a stable generic error schema. There is no per-client rate limit, so a determined human can still submit repeatedly. This is accepted for a personal site with a single recipient, where the cost of abuse is nuisance email rather than data exposure or spend, and where a rate limiter would need shared state that the current stateless deployment does not have.

Revisit if submissions are ever abused in practice, if the endpoint gains a costlier side effect than one email, or if the deployment acquires a natural coordination point. Prefer the platform's own edge rate limiting over application state if so.

## D-260811a — Keep the package manager's supply-chain defaults

- **Status:** Accepted
- **Decided:** 2026-08-11

Yarn 4.18 introduced three install-time protections. A routine version bump disabled all of them in the same commit, without a decision or history entry, so the project's security posture changed as an invisible side effect of a maintenance upgrade.

Package-manager hardening defaults are kept unless a specific, recorded need justifies an exception, and any exception is scoped to the narrowest unit that requires it:

- `npmMinimalAgeGate` keeps its `1d` default. The gate blocks versions published within the last day, which is the window a compromised release depends on. If it ever conflicts with automated updates, Dependabot's own `cooldown` is the correct lever — do not disable the gate repository-wide.
- `approvedGitRepositories` keeps its empty default. The lockfile contains no git-protocol resolutions, so a permissive pattern grants a capability nothing uses.
- `enableScripts` keeps its `false` default. Exactly one installed package declares an install script (`unrs-resolver`, reached through `eslint-import-resolver-typescript`), so it is allowed individually through `dependenciesMeta`. Notably `sharp` needs no exception: 0.35 ships prebuilt platform packages.

Those three govern what Yarn is allowed to install. **How Yarn itself arrives is the same question one level up**, so `packageManager` carries Corepack's integrity hash (`yarn@4.18.0+sha512.…`) rather than a bare version. Without it, Corepack downloads the CLI from `repo.yarnpkg.com` on every run and executes whatever comes back with nothing to check it against. Regenerate the field with `corepack use yarn@<version>` when the version changes; hand-editing the version string leaves a hash that no longer matches, and Corepack fails the run rather than falling back silently. The downloaded CLI barely matters in itself — `.yarnrc.yml` points `yarnPath` at the vendored `.yarn/releases/yarn-4.18.0.cjs`, so its only remaining job is to hand off to a binary the repository already contains — but it is still executed code, and it was the one link in this chain that nothing verified.

Verify changes here with a deleted `node_modules` and a full reinstall rather than an incremental one, because an already-built dependency will mask a missing permission.

## D-260809c — Modernise Google Maps in coordinated phases

- **Status:** Accepted
- **Decided:** 2026-08-09

`@googlemaps/react-wrapper` is archived and classic `google.maps.Marker` is deprecated, but Advanced Markers are not a constructor-level substitution. They change map setup, icon rendering, animation, cleanup and zoom behaviour.

Deliver the coordinated migration as small parity-preserving releases: maintained loader first; Map ID and cloud style second; Advanced Markers and their changed rendering/animation lifecycle third; final cleanup last. This gave each infrastructure boundary a focused test and manual-QA surface without prematurely rewriting the imperative marker layer. Loading/error states, geometry decoding, marker and polyline sequencing, information windows, zoom-responsive visuals and reduced-motion behaviour were preserved throughout. The completed phases and current implementation live in [Travel / Google Maps Feature](travel-feature.md#modernisation-phases).

The Map ID phase deliberately retained raster rendering to isolate cloud-style parity from renderer differences. Advanced Markers supported raster for the feature set used here, so the renderer was evaluated separately after marker parity rather than silently folded into either migration phase. Once all four phases passed manual QA, the Map ID was switched to vector and the reveal was independently updated to use its fractional zoom and camera controls.

## D-260809b — Treat the contact endpoint as a stable public boundary

- **Status:** Accepted
- **Decided:** 2026-08-09

Contact submissions contain personal data and trigger external email side effects. Transport details, raw provider errors and internal anti-automation behaviour must not leak through logs, responses or documentation.

The endpoint validates the method and request shape at runtime, enforces bounded fields, safely renders message content and returns a stable generic public error schema. Owner delivery is required; courtesy-confirmation failure is non-fatal so a client retry cannot duplicate an already delivered owner email. Bot verification and the secondary signal remain defense in depth, with sensitive mechanics deliberately undocumented. See [Contact Feature](contact-feature.md).

## D-260809a — Separate plans, decisions and history

- **Status:** Accepted
- **Decided:** 2026-08-09

The roadmap had become a combined backlog, changelog and migration diary. That preserved context but obscured the work that remained.

The [Roadmap](roadmap.md) now contains open work only. This file records durable rationale, while [Project History](project-history.md) is the concise release record. Detailed operational knowledge stays beside the feature it affects. When work is completed, remove it from the roadmap, update the relevant topical document, and add a short history entry; create or amend a decision only when the rationale is expected to influence future changes.

## D-260808b — Generate CSS declarations for WebStorm without shipping them

- **Status:** Accepted
- **Decided:** 2026-08-08

Mantine creates custom theme colour properties at runtime. WebStorm analyses CSS Modules statically, so it cannot discover those declarations and reports valid custom properties as unresolved.

`yarn css-vars:generate` derives `src/styles/mantine-custom-properties.css` from the theme colour source, and `postinstall` keeps it current. The file exists only for IDE analysis: it is gitignored and never imported by the application. Runtime values continue to come from `MantineProvider`. CI runs `css-vars:check` to validate generation rather than pretending the ignored output is committed source. See [Styling & Theming](styling-theming.md#webstorm-css-variable-resolution-mantine-custom-propertiescss).

## D-260808a — Use Mantine's static styling architecture

- **Status:** Accepted
- **Decided:** 2026-08-08

Mantine v7 removed the old Emotion-oriented integration and made CSS Modules, CSS variables and its PostCSS preset the natural path. Restoring a compatibility CSS-in-JS layer would preserve obsolete patterns and make the styling system harder to inspect.

Component styles use CSS Modules and Mantine style props; `postcss-preset-mantine` and `postcss-simple-vars` provide documented mixins and build-time breakpoints. Small finite variants use modifier classes rather than runtime-only custom properties. The project also retains Next's default PostCSS capabilities explicitly because defining a custom PostCSS config disables Next's built-in pipeline. See [Styling & Theming](styling-theming.md) for the implementation and migration-specific traps.

## D-260807a — Generate the service worker in every production build, never in development

- **Status:** Accepted; supersedes the `WITH_PWA` opt-in
- **Decided:** 2026-08-07; reaffirmed 2026-08-09; revised 2026-08-14

Offline support is a production feature. It was originally gated behind `WITH_PWA=true` so local and preview builds did not pay for service-worker generation. In practice `.env.production` always set it, so the flag only ever selected between what ships and a configuration nothing deployed — while costing a second CI build, a second build step in the release checklist, and a branch in `next.config.js`.

The gate is now `NODE_ENV`: every production build generates `public/sw.js`, and development never does. There is no flag to set anywhere.

**This is deliberately not Serwist's own `disable` option.** `withSerwistInit` attaches a `webpack` key to the config unconditionally — `disable` is only consulted inside that callback. Since `next dev` runs Turbopack, which `@serwist/next` does not support and warns about, wrapping unconditionally would put a webpack config in front of development. Returning early before the dynamic `import()` keeps Serwist out of dev entirely.

Production builds still use `next build --webpack` explicitly, because Next 16 hard-fails a Turbopack build when a webpack config is present. Development remains on Turbopack for speed. Revisit the webpack opt-out when a stable Serwist release supports the production bundler without custom compatibility work — `@serwist/next@10`, currently preview-only, may be that release. See [PWA & SEO](pwa-seo.md) and [Development Workflow](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

## D-260806a — Track Active LTS Node.js releases

- **Status:** Accepted
- **Decided:** 2026-08-06

The deployed runtime, local version file and Node type declarations must describe the same platform. Adopting a Current release early would add platform churn without meaningful benefit for this site.

Move Node only after the target release reaches Active LTS and the deployment host supports it. Update `engines.node`, `.nvmrc` and `@types/node` together, then validate installation, native dependencies, tests and a production build on that runtime. CI reads `.nvmrc`, so it follows the version change automatically. Node 26 is therefore scheduled for review on or after 2026-10-28 rather than being adopted while Current.
