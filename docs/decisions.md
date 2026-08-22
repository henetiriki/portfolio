# Engineering Decisions

This log records durable choices whose rationale is useful beyond the change that introduced them. It is intentionally selective: current implementation details belong in the topical documentation, completed work belongs in [Project History](project-history.md), and unfinished work belongs in the [Roadmap](roadmap.md).

## Identifiers

Each decision is identified by the date it was decided, in the form `D-YYMMDD` plus a letter: `D-260814a`, `D-260814b`. The date is the one recorded in `**Decided:**`, never the merge date, so a rebase cannot change an identifier. The letter is always present, even when a date holds only one decision, and is the next free letter for that date at mint time — normally merge order too, though a corrected date can take one out of that order rather than renumber published identifiers, as [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar) did. Where the two disagree, the order entries appear in this file is the merge order.

To mint one: take your decision date, look for that date already in this file, and take the next free letter. Nothing needs checking against other branches, and nothing is ever renumbered.

**A letter freed by a rename is retired, not recycled.** `D-260816a` was published and then renamed to [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar), so reusing it would silently point every stale inbound link at an unrelated decision — the one outcome renaming-in-place was avoided to prevent. `D-260816b` is therefore the first decision minted on that date.

Entries are newest first. Two branches adding a decision still collide textually at the top of the file; the resolution is to keep both, newest first, and for the same date put the later-merged one above — which is how [Project History](project-history.md) already resolves. See [D-260814d](#d-260814d--identify-decisions-by-date-rather-than-by-sequence).

## D-260822e — Colocate SEO copy with its page, and give images their own alt text

- **Status:** Accepted
- **Decided:** 2026-08-22

**`title` and `description` for every content route now live as a `const` in the page file that renders `Seo`, not split between pages and `@fixtures/*`.** `index.tsx` and `experience.tsx` already defined their description locally; `contact.tsx`, `portfolio.tsx` and `travel.tsx` instead imported it from `@fixtures/contact`/`@fixtures/portfolio`/`@fixtures/travel`. Nothing about a fixture import was wrong, but it split one page's search-facing copy across two files for no benefit — the description is presentation, read by exactly one consumer, not shared data. Making all five pages follow the pattern the other two already used removes the inconsistency rather than picking arbitrarily between it.

**Every page `title` also became a distinct, keyword-bearing phrase instead of the one- or two-word route/nav label** — `Front-End Engineer`, `Front-End Engineering Experience`, `Freelance Web Design Portfolio`, `Places I’ve Been`, `Get In Touch`, replacing `Portfolio`, `Experience`, `Portfolio` (again — `/` and `/portfolio` shared a title), `Travel` and `Contact`. `getSeoMetadata()`'s `"{Page Name} // Louw Swart"` template gave every route a technically-unique `<title>` already, but a search result or browser tab benefits from the page name itself saying what the page is about, and `/` and `/portfolio` having the identical title was the concrete symptom. The on-page `<h1>` (`Header`'s children) is deliberately untouched — it still matches the nav label — so this is a search/social-facing change only, not a rename of the page.

**Portfolio card and navigation-logo images now get `alt` text that describes the image, rather than reusing the adjacent title or link text.** `PortfolioItem.imageUrl: string` became `img: { alt: string; src: string }`, so an alt string is a required, per-item field rather than something the rendering page had to remember to derive (previously `alt={title}` in `portfolio.tsx`). Image search and screen readers both get more value from a caption of what the screenshot actually shows — the client, the site and its purpose — than from a repeat of text already next to the image. `Logo`'s alt moved from `'Ouwl'` to `'Ouwl.house — home'` for the same reason: the tooltip and link already say "Ouwl" contextually, and the alt text is the one description of what the linked image actually does.

**Reusing the title as alt text was not treated as a defect needing a broader audit.** No other image in the codebase (the hero photo, timeline icons, decorative waves) shared this pattern, and `FixedBackground`/decorative images intentionally use empty or context-appropriate alt text already covered by [Misc head-adjacent behaviour](pwa-seo.md#misc-head-adjacent-behaviour). Only the Logo and portfolio cards were changed because only they had alt text mechanically derived from a visible label.

## D-260822d — Run visual-baseline updates on the target branch, not a default-branch checkout

- **Status:** Accepted
- **Decided:** 2026-08-22

**Baseline generation is manual and branch-scoped.** A visual diff needs human review; automatically accepting every changed screenshot would turn a layout regression into its own approval. The updater therefore has no `push` or pull-request trigger, rejects `main`, and commits only PNGs under Playwright's snapshot directories to the named feature branch. The normal CI workflow remains read-only.

**The workflow runs from the branch selected in the Actions UI; it never checks out an operator-supplied ref from a default-branch run.** A manual workflow becomes available on a branch after that branch includes the version merged to `main`. This removes the cross-branch trust boundary that CodeQL correctly identifies as a cache-poisoning risk. The workflow rejects `main`, validates the selected branch's prefix, and does not use a dependency cache, so target-branch build code cannot populate a cache consumed by a trusted run.

**Only the commit job receives `contents: write`, and it never executes target-branch code.** The repository's Actions default remains read-only; the generator has no write token and passes an allowlisted artefact to the commit job. That job rechecks the selected revision and every path before copying PNGs into a clean checkout and pushing the commit. It does not create or approve pull requests, accepts no arbitrary shell input, and fails if a test generated a change outside the baseline PNG allowlist. This keeps CI's Linux render the source of truth without introducing a personal access token or widening the normal CI token.

**Artefact-only handoff was rejected as the permanent path.** It avoids a write-capable job, but makes every legitimate visual change a download/rename/commit round trip and leaves a maintainer deciding whether a locally rendered file matches CI. The workflow's safeguards keep the write surface smaller than a general-purpose bot while preserving the review gate where it belongs: before the manual run.

## D-260822c — Prompt splash-device coverage review from the calendar, not CI

- **Status:** Accepted
- **Decided:** 2026-08-22

**The calendar carries a mid-June and a mid-October reminder, with a further review after an iPhone or iPad-family announcement outside those windows.** October follows the September iPhone launch once its specifications have settled; June covers the less-predictable spring iPad and WWDC window. This is enough cadence to keep the table current without turning a small, manually researched task into a quarterly ritual.

**A calendar prompt is the right boundary for a personal review with no machine-readable truth.** D-260821i established that a CI check cannot discover an absent device class: Apple offers human-readable specifications, not a feed to compare with `SPLASH_DEVICES`. A scheduled workflow could only open an issue or send a reminder; it would add permissions, operational maintenance and a second inbox without improving the evidence. Adding it to each release checklist was rejected for the inverse reason: it would either impede unrelated releases or disappear during a quiet period.

**The prompt asks an agent to investigate and report, rather than silently edit the table.** It requires Apple sources, comparison of distinct width/height/pixel-ratio triples, and an explicit no-change result; third-party device lists may help locate candidates but are not evidence. A repeated triple needs no asset. Changes remain an explicit maintainer decision, after which the existing generator and `yarn icons:check` cover the implementation and internal consistency. No-change reviews stay in the calendar reminder rather than creating documentation churn in the repository.

## D-260822b — Use merged commits and Vercel deployments as the release record, rather than tags

- **Status:** Accepted
- **Decided:** 2026-08-22

**A squash merge is already the repository's immutable release identifier.** It gives every change one `main` commit with its pull request number and review history. The commit's Vercel status distinguishes a completed deployment from an ignored build, and its target links directly to the deployment Vercel created. To answer "what was live?", use the most recent completed production deployment rather than assuming `main`'s tip deployed — a documentation-only merge deliberately does not.

**Tags and semantic application versions were rejected.** This site publishes no release artefact and has no external compatibility contract, and `package.json`'s version is inert. A tag would only add a second name to a commit; it would not say whether Vercel actually built or promoted it. Creating tags automatically after a `main` push would either label failed and ignored builds as releases or require deployment-completion automation with credentials, gating and another stateful failure path.

**The initial proposal looked useful because a date alone is not a precise history citation.** The pull request number already supplies that stable reference and links to the review, checks and squash commit. Project History entries may cite the pull request when precision matters; Vercel's deployment record remains the authoritative runtime and rollback reference. Reconsider release numbering only if the project starts publishing artefacts, acquires versioned consumers or needs visitors to report a running build identifier.

## D-260822a — Compare preview changes with the last built preview, not the pull request base

- **Status:** Accepted
- **Decided:** 2026-08-22

`HEAD^ HEAD` was a safe production comparison because production receives one squash commit per pull request, but it was the wrong boundary for preview deployments: Vercel creates one deployment per push, so a batched push whose tip was documentation could cancel a preview that contained source changes. That left a pull request unable to complete its required manual QA on a preview URL.

**The initial preview now always builds, and subsequent preview pushes compare with `VERCEL_GIT_PREVIOUS_SHA`.** Vercel defines that as the last successful deployment SHA for the project and branch. It is the right practical baseline: once a preview represents the branch, a later documentation-only push can keep using it; a push that adds source since that preview builds. A newly opened documentation-only pull request still builds, which is necessary because no preview URL exists yet.

**Comparing against the pull request's merge base was rejected.** Vercel exposes a pull request ID but not its base SHA, and its Git checkout is shallow. A command depending on `origin/main` or a locally available merge base would therefore either require unverified network/history assumptions or make a missing base decide deployment behaviour. The previous-deployment SHA is supplied for this use and any unavailable reference fails open to a build.

**Production keeps the original comparison.** `VERCEL_ENV=production` still uses `HEAD^ HEAD`; only previews select the per-branch previous SHA. If the required system variables are unavailable, the command exits `1` in both cases, choosing a needless build over a skipped production deploy.

## D-260821k — Private security implementation record

- **Status:** Accepted
- **Decided:** 2026-08-21

The public record retains the decision identifier and outcome. The security implementation, rationale, validation evidence, and remaining trade-offs are maintained privately.

## D-260821j — Check internal documentation links in CI, rather than relying on the release sweep

- **Status:** Accepted
- **Decided:** 2026-08-21

A full documentation audit found four dead links: three cited a deleted security-documentation section and one cited a deleted source file. None were caught by the release checklist's own "cross-links between docs still resolve" line, because that line depends on whoever runs the sweep re-verifying every anchor across every file — including files the change in front of them never touched.

**This has an automatable answer, unlike the splash-device problem decided the same day in [D-260821i](#d-260821i--rely-on-manual-review-for-splash-device-coverage-not-an-automated-check).** That decision drew the line at "a check can only compare the repository against itself; it has nothing external to diff against" — device coverage needs to know what Apple has shipped, which nothing in the repository can answer. A link anchor has no such gap: the ground truth is the doc set itself. Whether `security.md#some-heading` resolves is fully determined by what's in `security.md`, so this is squarely on the automatable side of that same line, not an exception to it.

**`scripts/check-doc-links.mjs` follows the existing `css-vars:check`/`icons:check` shape** — no dependencies, walks the docs, fails non-zero on a mismatch — but sits on the opposite side of the docs-only gate. Those two skip on a documentation-only change because they check generated _source_ artefacts that prose cannot affect; this one exists specifically to check docs, so it runs unconditionally alongside `prettier:check`, the other ungated step, per the reasoning already established in [D-260815c](#d-260815c--give-documentation-only-changes-a-cheap-ci-path-rather-than-no-ci-run).

**GitHub's heading-slug algorithm had to be reverse-engineered rather than assumed, because this project has already been burned by it twice.** The 2026-08-15 entry in [Project History](project-history.md) records "GitHub keeps the underscore when it slugs a heading" as a real source of dead links, and every `D-YYMMDDx — Title` decision heading anchors with a double hyphen where the em dash sat (`d-260821i--rely-on-...`), which a naive "collapse whitespace" slugifier would silently merge into one. The checker strips anything that isn't a word character, hyphen or space, then converts each surviving space to a hyphen individually rather than collapsing runs — which is what a heading's em dash needs, since it leaves two adjacent spaces behind when removed. Verified against both known traps, not just clean headings.

**The four dead links were fixed by de-linking, not by repointing.** `decisions.md`/`project-history.md` entries stay as published once merged — D-260821g already declared the CSP-reporting decisions it superseded correct given what was known when they were written — so rewriting the surrounding sentences was out of scope. A link that pointed at real content when written and lost its target later is a defect in the hyperlink, not in the claim; the fix drops the markdown link syntax and keeps the referenced name as plain text, leaving each sentence's point intact.

## D-260821i — Rely on manual review for splash-device coverage, not an automated check

- **Status:** Accepted
- **Decided:** 2026-08-21

The [roadmap](roadmap.md) framed the splash matrix's staleness as one problem with one fix: "a check that fails when a known device class is unmatched." It is actually two problems, and only one of them is a check.

**No source exists for a check to run against.** `SPLASH_DEVICES`' point sizes were "verified per device rather than extrapolated" when the set was rebuilt ([D-260815e](#d-260815e--generate-the-pwa-icon-and-splash-set-from-one-vector-master)), which on inspection means manual research against Apple's specifications at the time — no source is cited, because there is no single authoritative, machine-readable one to cite. Apple publishes device specifications as human-readable documentation, not a feed. A CI check can only compare the repository against itself; it has nothing external to diff a new iPhone's screen size against. The four-year gap the previous set carried was exactly this failure mode, and nothing proposed here closes it.

**What a check can do is verify internal consistency**: that every entry in `SPLASH_DEVICES` has a matching generated asset, and every generated asset matches a table entry — catching a hand-edit to one without the other, or a deleted file. That is real, fully automatable, and does not depend on knowing what Apple has shipped. It remains open on the roadmap as its own task, separate from device coverage.

**Device coverage — noticing that Apple shipped a new screen size at all — has no automatable path**, and is left as periodic manual review rather than false-advertised as solved. Candidate mechanisms for prompting that review are listed on the roadmap rather than chosen here; none has been decided.

## D-260821h — Reproduce the public-directory precache scan to exclude the Apple splash images

- **Status:** Accepted
- **Decided:** 2026-08-21

`@serwist/next` precaches everything in `public/` by default, which meant the 42 Apple splash images ([D-260815e](#d-260815e--generate-the-pwa-icon-and-splash-set-from-one-vector-master)) were shipping into every installed app's offline cache to serve at most one file — iOS fetches its splash directly at launch, not through any page the service worker's `runtimeCaching` list would see. The [roadmap](roadmap.md) called excluding them "the obvious win."

**No configuration option does this, and two looked like they would before being read closely.** `globPublicPatterns` is `@serwist/next`'s only lever over what it scans from `public/`, and it takes positive include patterns exclusively — the `glob` package underneath dropped `!`-prefixed negation in major version 6, so there is no pattern that means "everything except this." `manifestTransforms` looked like the real answer, until tracing the call through `@serwist/webpack-plugin` into `@serwist/build`'s `transformManifest`: transforms run against `fileDetails` — webpack's own compiled JS/CSS assets only — and `additionalPrecacheEntries` (which is how `public/`'s scanned files actually reach the manifest) is appended in a later step transforms never see. Both findings came from reading the installed packages' source directly, since neither behaviour is documented.

**The fix is supplying `additionalPrecacheEntries` ourselves**, in `next.config.js`: a recursive walk of `public/`, MD5-hashed per file into `{url, revision}`, filtered to drop `apple-splash-\d+-\d+\.png` and mirror `@serwist/next`'s own hardcoded ignores (`sw.js`, `sw.js.map`, `swe-worker-*.js`). Providing this option at all skips the library's built-in scan entirely — there is no way to layer an exclusion on top of it, only to replace it, which is why the reproduction has to be complete rather than partial.

**The first version precached a stray `.DS_Store`.** `glob` ignores dotfiles by default; `fs.readdirSync` does not, and this machine's own Finder-browsed `public/.DS_Store` (gitignored, never committed) surfaced the gap immediately in the generated manifest. It would not have reproduced from a clean CI checkout, but the reimplementation was incomplete regardless of whether this particular instance of the bug was ever observable in production. Fixed by excluding any file whose name starts with `.`; dot-directories were not handled, since none exist in `public/` today and handling a case that cannot happen was judged not worth the extra code.

**Verified against the live registered worker's `caches` API, not the built file's text.** `service-worker.spec.ts` opens the precache cache after registration, asserts a known manifest icon is still in it and no splash image is, and was confirmed to fail — splash images present — with the exclusion reverted.

**Whether iOS's home-screen splash still renders offline was not verified by this change alone, and was recorded as open rather than assumed** — `apple-touch-startup-image` is a WebKit-only, OS-level mechanism no Chromium-based tool can observe, and available documentation of whether it shares any cache with a page's own service worker was thin and inconsistent rather than authoritative either way.

**Verified the same day, on an iOS Simulator rather than physical hardware.** No iPhone was available; the Vercel preview deployment for this change was added to an iPhone 17 Pro simulator's (iOS 26.5) home screen, launched once online to confirm the splash renders at all on current iOS, then the app was force-quit and relaunched with networking disabled. The simulator exposes no independent network toggle in iOS 26's reorganised Settings, so the host Mac's own Wi-Fi was switched off for the duration of the test rather than a simulator-only setting. The splash still rendered. This is not equivalent to a real device — the Simulator shares the host's virtualised network stack rather than a cellular radio, and nothing here rules out a difference on physical hardware — but it directly answers the question this decision left open: the splash's availability does not depend on Serwist's precache.

**Revisit if `@serwist/next` ever exposes an exclude option for `globPublicPatterns`.** That would let this reproduction collapse back into the one-line config it should have been.

## D-260821g — Private security operations record

- **Status:** Accepted
- **Decided:** 2026-08-21

The retired reporting surface and the operational decision trail are maintained privately. The public posture is an enforced policy tested before deployment; it does not operate a public reporting receiver.

## D-260821f — Assert icon contrast directly, scoped to what axe cannot see

- **Status:** Accepted
- **Decided:** 2026-08-21

Raised in review of [D-260821a](#d-260821a--give-the-mobile-icons-back-some-edge-clearance-and-a-colour-that-survives-contrast): that decision fixed a 1.72:1 icon and documented why axe never caught it — `color-contrast` only evaluates text nodes, and the icon is an SVG with `stroke="currentColor"`. Documenting the blind spot did not close it; nothing in the suite would have caught a second regression either. `accessibility.spec.ts` now reads each icon's computed `color`, walks up for the first painted `background-color`, and checks the ratio against WCAG 1.4.11's 3:1 floor for non-text UI. Every new test was confirmed to fail before being trusted: reintroducing the original bug reproduces 1.7162439…:1 almost exactly, and forcing the scroll-to-top icon to its own background colour produces exactly 1.

**Scope was widened past the one icon the review named, then deliberately narrowed again.** Every `@tabler/icons-react` usage in `src/` was surveyed for the same shape of risk. Two shared it: the experience timeline's section icons (the original bug) and the header's scroll-to-top control, both a `stroke="currentColor"` icon on a Mantine `filled`/coloured-circle background with no adjacent text of that exact pairing — the specific condition axe cannot see. Everything else surveyed was left out, and for a reason each time rather than by omission:

- **The outline buttons on `/portfolio`, the error pages, and the footer's social links** pair the icon with visible text in the identical colour, in the identical location. If that pairing's contrast breaks, the text breaks with it, and axe already checks the text. Adding an icon-specific assertion here would duplicate a check that already exists rather than close a gap.
- **The travel map's markers** (`Marker.tsx`, `MarkerLegend.tsx`) are excluded on the opposite basis: they are `fill`-based, not `stroke="currentColor"`, and `Marker.tsx` in particular paints onto live Google Maps imagery with no fixed background to assert a ratio against — the same reason WCAG itself carves out an exception for map content.

**A live bug in that same survey's scope was found afterward, from a screenshot rather than from the code.** The resting-state test above was green, but `Navigation.module.css`'s `.scrollToTop:hover` swaps the control's background to `shamrock.4` through a plain CSS rule Mantine's own colour computation never sees; the icon stayed white, reproducing the exact original 1.72:1 pairing on hover — confirmed live in a browser (`getComputedStyle` before and after a real, CDP-driven hover) before it was trusted as a real bug rather than a screenshot artefact. A dispatched `mouseover` event does not make an element match `:hover` in a real browser, so this needed genuine pointer input to observe, which is also why no automated check had caught it: it is invisible to both axe (SVG, as above) and to any assertion of the resting state alone. On touch devices `:hover` can persist after a tap with no `mouseleave` to clear it, so this was not a desktop-only curiosity. A second test hovers the control for real (`locator.hover()`) and reproduces 1.7162439…:1 before the fix; the fix adds `color: var(--mantine-color-black-russian-4)` alongside the existing `background-color` in the same rule, reusing the exact pairing [D-260821a](#d-260821a--give-the-mobile-icons-back-some-edge-clearance-and-a-colour-that-survives-contrast) already established for icon-on-`shamrock.4` (11.39:1) rather than inventing a new one.

**The three new tests live beside the axe pass in `accessibility.spec.ts` rather than in a new file**, because the file's own purpose — catching what jsdom and, here, axe itself cannot — is exactly what they extend. See [Development Workflow](development.md#browser-regression-suite) for the survived-vs-excluded reasoning restated for future additions, and `e2e/support/helpers.ts`'s `contrastRatio` for the WCAG relative-luminance math, kept general rather than tied to any one call site.

## D-260821e — Bound the fetcher's retries to transient failures and cut the per-attempt timeout

- **Status:** Accepted
- **Decided:** 2026-08-21

Raised in review: `fetcher` (`../src/utils/common/fetcher.ts`) retried every failure indiscriminately — a `404` or a malformed request got the same three attempts as a dropped connection — and each attempt carried a 30s `AbortController` timeout, so a client stuck on repeated timeouts could block its caller for up to roughly 90s (`30s × 3` attempts, backoff on top) before the default two retries were exhausted.

**Retries are now conditional, not unconditional.** `request` throws a `FetchError` carrying the HTTP status for non-OK responses; `isRetryable` treats network failures (including the abort-driven timeout, which never constructs a `FetchError`) and 5xx/429 responses as worth retrying, and lets every other 4xx propagate on the first attempt. A `404` or a malformed request will not change on a second try, so retrying it only added latency for a response the caller was always going to receive.

**429 was included alongside 5xx, not just 5xx as the review comment's parenthetical suggested.** Both API routes this wraps (`/api/rail-trips`, `/api/img-id`) are same-origin internal endpoints without their own rate limiting today, but a `429` is a textbook transient condition and there is no cost to handling it correctly ahead of need. The separate question of endpoint limiting is settled in a private operational record.

**The timeout moved from 30s to 8s, not to something more conservative.** Both call sites are internal API routes serving fixture data or a lightweight Instagram lookup — there is no reason a healthy response takes anywhere near 30s, and 8s still leaves comfortable headroom above normal latency. Worst case with the default two retries is now bounded at roughly 8s × 3 attempts plus backoff, versus the prior ~90s.

## D-260821d — Private browser-policy record

- **Status:** Accepted
- **Decided:** 2026-08-21

The visitor-facing outcome is documented in [Security](security.md#browser-protections). The exact capability scope and review rationale are maintained privately.

## D-260821c — Retired private operational record

- **Status:** Accepted
- **Decided:** 2026-08-21

This retired endpoint’s risk assessment and alternatives are maintained privately. It does not describe a current public surface.

## D-260821b — Retired private operational record

- **Status:** Accepted
- **Decided:** 2026-08-21

This retired endpoint’s defensive handling is maintained privately as part of its historical decision record.

## D-260821a — Give the mobile icons back some edge clearance, and a colour that survives contrast

- **Status:** Accepted
- **Decided:** 2026-08-21

`TimelineHeading`'s section icons sat 12px left of their `xs`+ position on mobile, moved there by [D-260816k](#d-260816k--reclaim-the-timelines-gutter-from-the-container-not-from-the-rail) to buy the timeline's readable column more width. Review found them sitting too close to the screen edge at that offset — the rail now moves back 5px (base margin `8px` → `13px`) and the icons shrink `2.5rem` → `2rem` below `xs`, with the icon's own negative margin recalculated so it stays exactly centred on the rail, the invariant `experience-gutter.mobile.spec.ts` already guards.

**An SVG connector was tried first, and dropped once a simpler fix was asked for directly.** The initial approach kept the icon at full size and drew a curved path bridging it to the rail wherever the two didn't line up — accurate to the original sketch that prompted the work, but heavier than the problem needed: a second component-local coordinate system to keep in sync with `Timeline`'s own margin, and a CSS module purely to hide it above `xs`. Discarded in favour of resizing the icon once asked to reduce it instead of bridging the gap.

**Shrinking the icon while keeping `align='end'` traded one alignment problem for another.** With the icon and title bottom-pinned, a shorter icon still met the rail flush — nothing about the icon-to-rail relationship changed — but the icon's visual centre dropped relative to the heading text, since it no longer filled the row's full height the way the unchanged 40px icon happened to. `align={{ base: 'center', xs: 'end' }}` fixes the heading alignment (desktop's icon still fills its row, so `align='end'` there is untouched) but reopens the icon-to-rail gap this time — closed by giving `Timeline` a matching `mt={{ base: -8 }}`, which moves the whole rail box up as one unit rather than touching anything inside it. Every dot's position relative to its own bubble is unaffected by construction: only the block's position on the page moved.

**The icon's colour was a separate, unrelated finding from the same review.** White on the circle's own rendered background (`shamrock.4`, `#27E278`) is 1.72:1 — under the 3:1 WCAG 1.4.11 floor for meaningful UI graphics, let alone 4.5:1 for text. `axe`, both in the e2e suite and re-run directly against the page to confirm, reports zero violations either way: its `color-contrast` rule evaluates text nodes, and this is an SVG icon with `stroke="currentColor"`, which the rule never inspects. `black-russian.4` (`#080A20`) comes out to 11.39:1 against the same background and is now the icon colour, applied via `c` on the wrapping `Flex` so `currentColor` resolves through to the icon's stroke.

## D-260818a — Pull the text outside the type scale onto it, per call site

- **Status:** Accepted
- **Decided:** 2026-08-18

Six sites named in the [roadmap item](roadmap.md) opened by [D-260816f](#d-260816f--put-the-type-scale-back-on-mantines-defaults-and-make-leading-a-ratio) were reviewed one at a time rather than converted as a set, per that item's own instruction. All six now read a `--mantine-font-size-*` token or a Mantine size keyword (`fz='xl'`) instead of a hardcoded value.

**Two of the seven hardcoded values found were dead CSS, not typography.** `TimelineInstitution.module.css`'s `.link span` and `portfolio.module.css`'s `.titleLink span` both styled a `span` inside an `Anchor` whose content is a plain string (`name: string`, `title: string`) — neither component ever renders one. Both rules have matched nothing since at least the v7 Mantine migration. They were removed rather than converted; there was no text to size.

**Most conversions land exactly on the value already there, which is the point.** `Header.module.css`'s `1.25rem` sub-heading and `TimelineInstitution`'s `fz='1.25rem'` institution name both already equal 20px — the same number the fixed `xl` token now holds, where before the base fix `xl` was 18px. Swapping the hardcoded value for the token changes nothing on screen; it only stops the value drifting out of step the next time the scale moves, which is the failure this whole item exists to close off.

**Where a site was reviewed live and judged too small, it moved beyond a 1:1 token swap, deliberately.** The travel map's `InfoWindow` title and description (`Marker.module.css`) went `md`→`lg` and `sm`→`md`; the portfolio card's bold lead-in span (`portfolio.module.css`'s `.cardText span`) went `md`→`lg`. These are opinion, not restoration — the roadmap item is explicit that some call sites are deliberately independent of body copy, and a map marker earning its own larger scale is exactly the kind of judgment call it asks for per site rather than as a blanket rule.

**The mobile drawer link (`NavigationLink.module.css`'s `.link.sm`) is the one call site with no token to restore.** Its `rem(24px)` sits above the whole default scale — `xl` (20px) is the largest token Mantine defines — so unlike the other five sites, pulling it onto the scale means shrinking it, not converting a coincidentally-matching value. It was moved to `xl` on request; if that reads as too small next to the rest of the drawer, the fix is a new decision to keep a hardcoded value here on purpose, not a bigger token, since none exists.

**`TimelineLocation`'s `size='sm'` and `TimelineFromTo`'s unset (`md`-default) size were never hardcoded and were not part of the six call sites** — they already read the theme and moved with the base fix (12px→14px, 14px→16px) without anyone touching them. `TimelineLocation` was raised to match `TimelineFromTo` (both now default to `md`) once side-by-side review showed the gap between duration and location read as inconsistent, not because either was outside the theme.

## D-260816k — Reclaim the timeline's gutter from the container, not from the rail

- **Status:** Accepted
- **Decided:** 2026-08-16

The left inset on `/experience` narrows below the `xs` breakpoint by making four of its five layers responsive: the Mantine `Container` inside `Content` drops its padding, `TimelineBox` reduces its rail-to-card padding, `TimelineContent` reduces its own, and the rail moves 12px nearer the edge with `TimelineHeading`'s icon shifted by the same amount to stay centred on it.

**The rail's offset is an alignment constant, and moving it alone breaks that silently.** `TimelineHeading`'s icon is a `2.5rem` circle sitting at the container's content edge, so its centre falls exactly 20px in — which is where the rail is drawn. The margin can be reduced, but only in step with the icon: the two move together or not at all, and nothing about the markup says so.

**The rail stops 12px short of matching the card's right gutter, which was the proposal.** Aligning them exactly — rail 24px from the edge, as the card is from the other — is the symmetry the layout appears to be reaching for, and it is worth another 8px of column. It puts the section icons 4px from the screen edge: the only element on any page outside the site's 24px left margin, sitting in the rounded-corner and edge-swipe zone on both platforms. The icons are the anchor for each section and the worst candidate for that spot. Twelve pixels of overhang reads as a deliberate break; twenty reads as a mistake.

**Rail symmetry would not have produced a symmetric page anyway**, which is the part worth keeping. The block a reader sees is the text, not the hairline rail: at 412px the copy runs 93px from the left and 40px from the right, and moving the rail flush leaves it at 73 against 40. Most of that difference is the rail-to-card gap and the arrow, so no position of the rail equalises it. The gap, not the rail, is where the remaining asymmetry lives.

**The container is the layer that moves both at once, which makes the largest win also the safest.** The icon sits at the container's content edge and the rail is measured 20px from the same edge, so removing that padding at mobile widths shifts the pair together and the alignment survives untouched. It returns 32px — more than either timeline-local change — while being the one edit that cannot break the invariant above. That was not obvious from the layer list, which reads as five independent insets.

**`TimelineContent`'s arrow puts a floor on the rail-to-card padding that is invisible in the markup.** The card's `::before` is drawn at `right: 100%`, outside the card, into the same gap the dot occupies. Taking the padding to 24px — the value the arithmetic suggested — put the arrow tip through the dot. The padding stops at 32px, and the arrow narrows below `xs` so the clearance matches what it has at desktop widths.

**The regression spec asserts ratios and relationships, not the values these produced.** The column is asserted against the viewport rather than in pixels, because any future spacing change moves the number without touching the property worth holding. The alignment invariants are asserted directly, since they are what a plausible future fix would trade away for width. The column assertions were confirmed to fail on the previous layout; the invariants pass on both, which is what they are for.

**The container change reaches every page, deliberately.** `Content` wraps all five routes, so each gains the same 32px below `xs`. The padding it removes was duplicated — `Content`'s own `Box` already insets by 24px at that width — so what goes is a second inset inside the first, not the page's margin. `MapError` keeps its own container and is unaffected, being a sibling of `Content` rather than a child.

## D-260816j — Private scanning-configuration record

- **Status:** Accepted
- **Decided:** 2026-08-16

Code scanning supports normal review. Its provider configuration, operational history, and gate rationale are maintained privately.

## D-260816i — Watch project coverage without blocking on it

- **Status:** Accepted
- **Decided:** 2026-08-16

[`codecov.yml`](../codecov.yml) enables the whole-project status as `informational: true` at `target: auto` with a `0%` threshold, and Jest's global `coverageThreshold` moves from 80% to 95%. `codecov/patch` remains the only required coverage check.

**`codecov/patch` has a hole, and a fixed floor 20 points below the truth did not cover it.** Patch coverage judges only the coverable lines a pull request changes, so a change that deletes a test file has no coverable changed lines at all and passes trivially — while whole-project coverage falls. Jest's 80% floor could not notice a fall from 100% to 85%, which is the exact shape of that regression. The two instruments left a gap between them rather than overlapping.

**Whole-project status was previously `off` for a plan reason that no longer applies.** It was unavailable to a _private_ repository on the free Developer plan; publication on 2026-08-16 removed the constraint, which is what reopened the question.

**Requiring it was rejected because project status is a comparison and patch is not.** `codecov/patch` is computed from the pull request's own report and survives a missing base — demonstrated by [#189](https://github.com/henetiriki/portfolio/pull/189), which passed while `main` still carried an upload Codecov had silently dropped. A project status has nothing to compare against in that situation, and what Codecov does then was never verified. The one failure mode this repository has actually experienced would therefore land on the new check and nothing else, and the expensive direction of being wrong is a required check that never reports — the permanently-pending shape that earlier work deliberately spent effort eliminating.

**Informational keeps the signal and discards that risk.** `codecov/project` always posts as success on GitHub, carrying the real delta in its description, so a dropped base upload degrades the report rather than the branch protection. If the ratchet later proves it earns a merge gate, promoting it is a one-line change plus a ruleset edit — the reverse is a repository nobody can merge into.

**`hide_project_coverage` flips to `false` in the same change, because otherwise the ratchet has no output anyone reads.** It was `true` for a reason that expired with `project: off` — there was no project number to hide. Left set, the delta would exist only in the `codecov/project` status description, behind an expand. Enabling a status and then suppressing its report is the failure mode this avoids. The comment layout stays condensed, so the cost is a few lines.

**Codecov has no per-pull-request graphic to reach for instead**, which is the answer to the obvious follow-up. Its sunburst is whole-repository, the comment and statuses are text, and the only visual review aid is the GitHub Checks annotation — which Codecov is itself deprecating. Jest's HTML report is richer and local-only, and hosting it would duplicate the annotations at greater cost. See [Testing](development.md#testing).

**The 95% floor is the half that actually enforces, and it enforces locally.** It lives in `CI / Validate` and in `yarn test:coverage`, so it fails before a push rather than after a third party reports. 95% was chosen over 100% deliberately: the suite covers every function and branch today and no file or line is ignored to achieve it, so a hard 100% would make that claim load-bearing and force an `istanbul ignore` the first time a genuinely untestable path appears — biting precisely when the escape hatch is wanted. The gap left is real slack, not a rounding allowance.

## D-260816f — Put the type scale back on Mantine's defaults, and make leading a ratio

- **Status:** Accepted
- **Decided:** 2026-08-16

`fontSizes` in [`theme.ts`](../src/styles/theme.ts) is Mantine's own scale — 12/14/16/18/20 — and `body`'s `line-height` in [`global.css`](../src/styles/global.css) is a unitless `1.5`. Body copy moves from 14px to 16px.

**The headings were on a conventional scale and the body was one step below it.** Every token sat a notch under Mantine's default, and `Text` defaults to `md`, so every paragraph on the site rendered at 14px beneath headings stepping 24px → 20px. The compression read as the headings being too large, when the body was in fact small — which is how it was described before it was measured.

**The leading was pinned, and that mattered more than the sizes.** `body` carried `line-height: 1.5rem`, an absolute 24px rather than a ratio. At 14px that is 1.71 and generous, which is part of why small body copy read acceptably; at 18px it would have been 1.33 and cramped. Raising the sizes without this would have made the worst-affected text worse. A unitless value tracks whatever size it lands on.

**`Text` and `Input` default to different tokens, and assuming otherwise nearly shipped a defect.** The plan was to drop the contact form's `size='lg'` as a workaround made redundant by a larger `md`. Measuring showed `Input` defaults to `sm`, not `md`, so removing the prop rendered the fields at 14px — under the 16px threshold that makes iOS Safari zoom on focus — and shrank the control from 50px to 36px. `size='lg'` is not compensation for a small `md`; it sets a deliberate 50px control height, and it stays.

**A control's box does not scale with the token.** `--input-height` and `--button-height` are Mantine's per-size constants; only `--input-fz` and `--button-fz` read the theme. So the form's text grew inside boxes that did not, which is the intended outcome here but is worth knowing before assuming a token change resizes a component.

**About half the site's text is outside this scale entirely** — the header navigation, page sub-headings, timeline entries, map markers and portfolio cards all size themselves in CSS Modules or inline. They are deliberately untouched here rather than swept along: folding them onto tokens is an opinionated change that deserves its own review, and it is [open work](roadmap.md).

## D-260816h — Prefix every branch name, and keep the set to four

- **Status:** Accepted
- **Decided:** 2026-08-16

Branches are `<prefix>/<hyphenated-description>` with `feature/`, `fix/`, `docs/` or `chore/`. The convention is written down in [AGENTS.md](../AGENTS.md#branch-names); before this, the only mention anywhere was a release-checklist line saying `feature/*`, which roughly a third of merged branches followed.

**The practice was already three conventions, and none of them was wrong.** Of the thirty branches merged before this one, most were bare kebab-case, nine used `docs/` and seven used `feature/`. Nothing arbitrated, so each branch was named by whichever habit was closest to hand — and the bare majority meant the prefix, when present, carried no information, because its absence meant nothing.

**`docs/` is a verifiable claim; the other three are not.** This repository already classifies changes twice — CI's cheap path and Vercel's `ignoreCommand` — and `docs/`'s scope is exactly the first and a subset of the second, so the prefix is a prediction the build either confirms or contradicts. That is a property a naming convention does not usually get, and it is the reason the set is worth having at all rather than a nicety.

**The same was claimed for `chore/` and it is false**, caught by the documentation sweep on this change rather than by review. Vercel excludes a list of paths, not a category of intent: a dependency bump, an `eslint.config.mjs` edit or a workflow change is invisible to a visitor and deploys anyway, while a `chore/` touching only `e2e/` does not. The claim was plausible because this very branch is a `chore/` whose deploy _was_ skipped — one confirming instance, generalised without checking the list. `feature/` and `fix/` never claimed anything and are kept because the set has to cover every branch, or people fall back to bare names.

**Adopted from [Conventional Branch](https://conventionalbranch.org/) rather than invented**, minus `hotfix/` and `release/`. Both presuppose a release process this repository does not have: every merge to `main` deploys to production automatically, with no tags or version numbers ([release checklist](release-checklist.md)), so there is no release to prepare and an urgent fix is procedurally identical to any other `fix/`. Taking the published spec and subtracting is cheaper to justify than a bespoke list, and it keeps the door open to the prefixes we dropped.

**The argument for dropping `feature/` was made and rejected.** On a repository where every branch is a feature the prefix looks like pure tax, and the alternative proposed was bare names with `docs/` as the one exception. That was declined on the grounds of habit — which is the right call for a convention whose entire value is that it is followed without thinking. A rule that has to be remembered against an existing reflex is a rule that erodes.

## D-260816g — Serve the browser suite on 3001, and leave 3000 to `next dev`

- **Status:** Accepted
- **Decided:** 2026-08-16

`playwright.config.ts` serves on port 3001 with `reuseExistingServer: false` in every environment. Port 3000 is reserved for `next dev`.

**The pin to 3000 outlived its reason.** The config called the port "not negotiable" because the Google Maps API key is restricted to `http://localhost:3000` — true of the key, and irrelevant to the suite, because `blockGoogleMaps` aborts `**://*.googleapis.com/**` at the network layer in every spec. That includes the one spec that appears to be an exception, which asserts the travel page's error state and depends on the abort to produce it. CI supplies a dummy key besides. Nothing in the browser suite has ever authenticated against Maps, so nothing in it cared what port it ran on. The restriction is real for manual QA under `yarn dev`, which is exactly what now keeps 3000.

**A shared port made an agent and a human contend for one server.** Both need 3000 for different things — a dev server to watch changes land, and a production server to test against — and `reuseExistingServer` outside CI meant Playwright would attach to whichever it found. A suite that silently ran against a dev build, or against a stale `next start` serving output since rebuilt, is worse than one that will not start: it fails across every spec at once and reads as a regression in the change under test. That misdiagnosis has cost debugging time twice.

**`reuseExistingServer` is `false` rather than `!isCI`.** On a port nothing else claims there is nothing legitimate to attach to, so reuse can only ever be right by accident. The cost is a server boot on each local run; the gain is that an occupied 3001 fails loudly and immediately.

**Both `.claude/launch.json` servers moved to 3001 too, and that costs Maps in the agent's preview.** Reserving a port is only worth doing if the tooling honours it, and that file is how an agent starts a server. The consequence is real: a dev server on 3001 fails Maps authorisation, so the travel map renders as `MapError` in the browser pane. Accepted because manual QA belongs on the Vercel preview URL rather than an agent's localhost — the [pull request checklist](../AGENTS.md#opening-a-pull-request) says so already. Adding `http://localhost:3001` to the key's allowed referrers would undo the loss and was not done: it widens a credential's origin list for a convenience, and it is a change outside git that would then need [recording](../AGENTS.md#documentation-discipline). _Superseded the same day: the port was added to the key's allowed referrers, so the map renders on 3001 and the loss described above no longer applies. The recording it called for is [Security](security.md#accepted-exposure), which deliberately does not reproduce the list itself._

**The compiled output was never the conflict, which took measuring to establish.** Next 16 writes dev output to `.next/dev`, and `next build` clears `.next` with `cache`, `dev`, `lock` and `trace` excluded — `node_modules/next/dist/build/index.js`, the `clean` trace. So a production build alongside a running dev server disturbs nothing, and the port was the whole of the problem. `yarn clean` is the exception, being `rm -rf .next`.

## D-260816e — Head the About section with the role, not a second copy of the name

- **Status:** Accepted
- **Decided:** 2026-08-16

The About block on the home page is `h2` "About me", `h3` "Front-end Engineer", then the location as a subtitle beneath it. The `h3` carrying "Louw Swart" is gone.

**The name was in the outline twice and the section was not in it at all.** The hero already renders "Louw Swart" as the page's `h1`, so the `h3` repeating it added nothing a reader or a crawler did not have. Worse, it pushed the job title down to `h4` — the same level as the genuine section headings "Open Source Contributions" and "Hobbies and Interests" — so the outline read `About me → Louw Swart → Front-end Engineer, Wellington NZ`, with the biography paragraphs appearing to belong to a section named after a job title. Promoting the role fixes both: the outline names the person once, and every heading below it names a section that exists.

**"Front-end Engineer" is a real heading, which is why it is one.** The three paragraphs under it are about exactly that career, and the two `h4`s below are subsections of it.

**The first attempt treated the symptom, and review caught it.** That version kept the `h3` name and demoted the role to a non-heading subtitle, which removed the bogus node from the outline but left the duplicated name in place and the section unnamed. Removing the name instead — on the grounds that the page already carries it as the `h1` — was called in review, and it is the better fix because it resolves both problems with one deletion rather than working around one of them. Recorded because the wrong version is the one that looks obviously right when the presenting complaint is "this line wraps".

**The wrap forced the question rather than created it.** "Front-end Engineer, Garden Route, South Africa" needs about 500px in a 464px column, so it wrapped where "Front-end Engineer, Wellington NZ" had not. The duplicated name and the overloaded heading level both predate this change; the longer string only made them visible.

**The location is a subtitle, at `lg` in `whisper-5`.** 16px sits between the 24px `h3` above it and the 14px body copy below, so it reads as a subtitle rather than as the first line of the biography, and it measures 8.1:1 against the content box — comfortably past AAA. Both lines fit without wrapping at desktop and at 375px.

**Nothing is lost for search.** The location is still ordinary text in the document, and the page's real signal for it is the meta description, which [D-260816d](#d-260816d--name-the-region-rather-than-the-town-and-take-en-zas-date-order) corrected in the same change.

## D-260816d — Name the region rather than the town, and take `en-ZA`'s date order

- **Status:** Accepted
- **Decided:** 2026-08-16

The home page says "the Garden Route, South Africa" in both places it states a location, and the build timestamp formats with `en-ZA` and `Africa/Johannesburg`.

**The region is as precise as a public page should be.** A town name is more identifying than the site needs to be, and the wording it replaces was a region-sized city rather than a suburb, so nothing is lost in kind. It also matches what the travel map already shows without duplicating it: the map's `current: true` city is the precise answer for anyone who wants it, so the prose does not need to be.

**The preposition is "on", not "in".** South Africans are based _on_ the Garden Route, the way one is on a coast rather than in a city, and the description says so. It reads like a typo to anyone who has not heard it, which is exactly why it is recorded here rather than left to be "fixed" later.

**`en-ZA` formats year-first, and that was accepted rather than overlooked.** The timestamp moves from `17/08/2026, 00:19 NZST` to `2026/08/16, 14:19 SAST` — the date order changes, not just the zone. Keeping day-first meant `en-GB`, whose short zone name for Johannesburg is `GMT+2`, since `SAST` exists only in the South African locale. Naming the zone is what the footer line is for, so the locale that names it wins; `2026/08/16` is a South African convention rather than a compromise, and year-first sorts correctly besides.

**Both halves are one change because both are the same fact.** A footer timestamp in New Zealand time and a subtitle claiming Wellington are the same stale assumption, and splitting them would have left the site half-corrected for however long the second branch took.

## D-260816c — Keep the ruleset free of bypass actors, and accept the wedge risk

- **Status:** Accepted
- **Decided:** 2026-08-16

The `main` ruleset has no bypass actors. The Repository admin role briefly held an `always` bypass when protection was first enabled, and it was removed the same day so that the merge button cannot be clicked past a failing required check. On a repository with one maintainer, a bypass that exists is a bypass that gets used under mild time pressure, which makes every rule above it advisory.

**The cost is real and was paid within hours.** Renaming the required check during [D-260816b](#d-260816b--split-ci-into-concurrent-jobs-with-the-classification-in-its-own) left the ruleset naming a check that no longer ran, and `main` was briefly unmergeable with no bypass to escape through. That is the scenario the original bypass was there to prevent.

**Editing the ruleset is the escape hatch, and it is a better one.** The owner can always change the rule, so the protection was never truly locked — the difference is that lifting a rule is deliberate, visible in ruleset history and scoped to the thing that is wrong, whereas a standing bypass silently applies to every rule on every merge. The wedge is also self-announcing: a required check that never reports is obvious, unlike a check that was quietly bypassed.

**Ruleset history is the record.** `gh api repos/<owner>/<repo>/rulesets/<id>/history` retains every version with its full state and the actor who changed it. Nothing in the repository records a settings change, so this is the only place a claim about protection can be checked — and a documentation entry describing settings can be accurate when written and stale an hour later, which is exactly what happened to the publication entry in [Project History](project-history.md).

## D-260816b — Split CI into concurrent jobs, with the classification in its own

- **Status:** Accepted
- **Decided:** 2026-08-16

`ci.yml` ran everything in one serial `Validate & build` job, so lint, types, formatting and the unit suite all waited behind a production build, a ~270 MB Playwright download and the browser suite. Nothing in the fast half feeds the slow half: the fast checks read source, and only the browser suite needs `.next`, because Playwright's `webServer` starts `yarn start`. They now run as `Validate` and `Build & browser suite`, concurrently.

**Two parallel jobs each pay their own `yarn install`, and that is now free.** This was the constraint that put the split behind publication — a second install billed against the free monthly Actions allowance on a private repository. Public repositories get unmetered Actions minutes, so the trade of money for latency became a straight win rather than a judgement call. The Next build cache belongs solely to the second job, so the two do not contend for it either.

**The classification needs its own job because `steps.*` does not cross job boundaries.** Both jobs consume the documentation-only answer from [D-260815c](#d-260815c--give-documentation-only-changes-a-cheap-ci-path-rather-than-no-ci-run), so it moves into a `classify` job that does a two-commit checkout, runs one `git diff` and exposes an output. It installs nothing and costs seconds, which is what makes an extra job affordable here.

**The split subsumes half of the cheap path.** `Build & browser suite` _is_ everything that path skips, so it becomes one `if:` on the job rather than a gate per step. `Validate` keeps per-step gates, because `prettier:check`, the Jest run and the Codecov upload all still run when the rest of it does not.

**A job skipped by an `if:` satisfies a required check; a workflow skipped by `paths-ignore` does not.** That asymmetry is load-bearing and is the same one D-260815c turned on, now applied at job rather than step granularity: a conditionally skipped job reports success, while a filtered-out workflow never reports and leaves the requirement pending forever. It is why the gated job can be required on `main` at all.

**Splitting renames the required check, which is the risk the change actually carries.** `Validate & build` no longer exists, and a ruleset requiring a check that no longer runs blocks every pull request indefinitely. The ruleset was updated to require `Validate`, `Build & browser suite` and `codecov/patch` in the same window as the merge — see [Project History](project-history.md).

## D-260815h — Private browser-policy rollout record

- **Status:** Accepted
- **Decided:** 2026-08-15

The policy is enforcing. The rollout sequencing, exact configuration, and residual trade-offs are maintained privately.

## D-260815g — Precache the `/_offline` document, which the build manifest omits

- **Status:** Accepted
- **Decided:** 2026-08-15

`service-worker/index.ts` appends `{ url: '/_offline', revision: NEXT_PUBLIC_LAST_MODIFIED }` to the precache entries rather than passing `self.__SW_MANIFEST` through unchanged. **Without it the offline fallback could never produce a response, and had not been able to for as long as it has existed.**

**The manifest contained the offline page's JavaScript chunk but not its HTML.** `@serwist/next` builds the list from two sources: webpack assets, and a glob over `public/`. A Pages Router route is prerendered to `.next/server/pages/_offline.html`, and the plugin's `exclude` drops everything under `server/` — so `/_next/static/chunks/pages/_offline-<hash>.js` was precached and the document was not. `PrecacheFallbackPlugin` answers by calling `matchPrecache('/_offline')`, which returned `undefined`, so the plugin returned `undefined` and the navigation failed with `ERR_FAILED`.

**This was a real defect, not a consequence of the related private browser-policy change.** Confirmed by rebuilding against the unmodified `defaultCache` worker and re-running the new spec: it fails identically. The two changes landed together because the offline coverage added alongside the same-origin worker is what surfaced it.

**Why it went unnoticed.** The release checklist carried "`/_offline` serves when offline" as a manual check, and a manual check performed on a page that had already been visited passes on the runtime cache without the fallback ever being consulted. The failure needs an offline navigation to a route the worker has never seen — which is precisely the case a person testing their own site is least likely to produce. `e2e/service-worker.spec.ts` now covers both, and the distinction between them is the point of having two tests rather than one.

**The revision is the build timestamp**, `NEXT_PUBLIC_LAST_MODIFIED`, already computed in `next.config.js` for the footer. A precache entry with a null revision is treated as immutable, so the offline page would never update; the timestamp changes every build, which is exactly the invalidation this needs. Webpack replaces the expression with a string literal, so no `process` reference reaches the worker — verified in the built output, because a surviving reference would be a `ReferenceError` that stops the worker installing at all.

## D-260815f — Private offline-delivery record

- **Status:** Accepted
- **Decided:** 2026-08-15

The service worker preserves the public offline experience without broadening browser-policy exposure. Its cache configuration and regression rationale are maintained privately.

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

**A cheap path, not an absent one.** `prettier:check` runs `prettier .` across the tree, so Markdown and JSON _are_ checked, and on a documentation-only change it is the only check that applies to what changed — a blanket skip would remove the one thing still worth running. `eslint` and both type-checks cover no Markdown and `css-vars:check` reads `colors.ts`, so all three are gated. Jest cannot be affected by prose either, but it runs regardless: see the resolution below.

**`paths-ignore` was rejected before it was tried.** A workflow filtered out that way never reports, and a required check that never reports leaves a pull request pending forever — so it would silently break the branch protection now in place on `main`. The filter is an `if:` inside the workflow, so the jobs still run, or skip, and still report success. That is the whole reason for the shape, and [D-260816b](#d-260816b--split-ci-into-concurrent-jobs-with-the-classification-in-its-own) relies on the same asymmetry at job granularity.

**The exclusion list is CI's, not Vercel's, and copying would have been the obvious mistake.** Vercel asks whether a change can reach a visitor; CI asks whether a change can affect lint, types, tests or the build. `e2e/` and `playwright.config.ts` are excluded from the deploy and are precisely the paths whose change _must_ run the browser suite. Verified against real commits rather than reasoned about: replaying the classification, [#173](https://github.com/henetiriki/portfolio/pull/173) takes the full path on `e2e/` alone while Vercel skipped it, and [#166](https://github.com/henetiriki/portfolio/pull/166) takes the full path on `.gitignore` alone — which is in neither list, on both sides, because it decides what the build has to work with.

**One `git diff`, matching `vercel.json`'s shape, and it fails open.** `HEAD^` is the base tip on a pull request — the checked-out ref is the merge commit — and the previous tip on a push to `main`, so a single command covers both events; the checkout carries `fetch-depth: 2` for that parent. Any failure to resolve it exits non-zero and the change is treated as not documentation-only, so the failure mode is a needless full run rather than a missed check. The same direction `vercel.json` chose.

**One consequence was owed to whoever enabled branch protection, and it was paid.** The cheap path originally skipped the Jest run, so no report was uploaded and `codecov/patch` could not post a status at all on a documentation-only pull request — requiring that check would have reintroduced exactly the permanently-pending failure `paths-ignore` was rejected for. The gate was removed before the check was required, so the case never arose.

**Resolved the same day it was raised, and applied on 2026-08-16: the Jest run and the Codecov upload are no longer gated.** Skipping them was this decision's one concession to the roadmap's original shape, written before anyone priced the run — the unit suite takes seconds locally, against a production build and a ~270 MB browser download. It is a few percent of the saving, and paying it removes the branch-protection edge case rather than betting on Codecov's behaviour with no upload. Sequenced onto publication because that is when a required check first existed to be blocked; the shape of the cheap path is otherwise unchanged.

## D-260815b — Private temporary-observation record

- **Status:** Accepted, and deliberately temporary — delete with the Report-Only window
- **Decided:** 2026-08-15

This was a temporary observation mechanism, now retired. Its operating details and closure rationale are maintained privately.

## D-260815a — Private browser-coverage record

- **Status:** Accepted
- **Decided:** 2026-08-15

Browser coverage isolates stateful offline behaviour. The test configuration and policy-validation detail are maintained privately.

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

## D-260814c — Private historical browser-policy record

- **Status:** Accepted
- **Decided:** 2026-08-14

The exact historical policy, reporting design, source allowlists, and rationale are maintained privately. Current public behaviour is described in [Security](security.md#browser-protections).

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

## D-260811b — Private contact-protection record

- **Status:** Accepted
- **Decided:** 2026-08-11

The contact form provides server-side validation and automated-abuse protection. Its exact controls, accepted limitations, and review criteria are maintained privately.

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

The endpoint validates the method and request shape at runtime, enforces bounded fields, safely renders message content and returns a stable generic public error schema. Owner delivery is required; courtesy-confirmation failure is non-fatal so a client retry cannot duplicate an already delivered owner email. Bot verification and the secondary signal remain defence in depth, with sensitive mechanics deliberately undocumented. See [Contact Feature](contact-feature.md).

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
