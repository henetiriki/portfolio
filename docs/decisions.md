# Engineering Decisions

This log records durable choices whose rationale is useful beyond the change that introduced them. It is intentionally selective: current implementation details belong in the topical documentation, completed work belongs in [Project History](project-history.md), and unfinished work belongs in the [Roadmap](roadmap.md).

## Identifiers

Each decision is identified by the date it was decided, in the form `D-YYMMDD` plus a letter: `D-260814a`, `D-260814b`. The date is the one recorded in `**Decided:**`, never the merge date, so a rebase cannot change an identifier. The letter is always present, even when a date holds only one decision, and is the next free letter for that date at mint time — normally merge order too, though a corrected date can take one out of that order rather than renumber published identifiers, as [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar) did. Where the two disagree, the order entries appear in this file is the merge order.

To mint one: take your decision date, look for that date already in this file, and take the next free letter. Nothing needs checking against other branches, and nothing is ever renumbered.

**A letter freed by a rename is retired, not recycled.** `D-260816a` was published and then renamed to [D-260815i](#d-260815i--wait-for-the-chromium-fix-instead-of-working-around-the-android-navigation-bar), so reusing it would silently point every stale inbound link at an unrelated decision — the one outcome renaming-in-place was avoided to prevent. `D-260816b` is therefore the first decision minted on that date.

Entries are newest first. Two branches adding a decision still collide textually at the top of the file; the resolution is to keep both, newest first, and for the same date put the later-merged one above — which is how [Project History](project-history.md) already resolves. See [D-260814d](#d-260814d--identify-decisions-by-date-rather-than-by-sequence).

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

## D-260816j — Keep CodeQL on default setup, and leave it unrequired

- **Status:** Accepted
- **Decided:** 2026-08-16

Code scanning stays on GitHub's default setup rather than a committed workflow, and no CodeQL check run is added to the `main` ruleset. Current behaviour is in [Security](security.md#code-scanning-codeql).

**Maintenance is the argument usually made for default setup, and here it is the weak one.** Dependabot already covers the `github-actions` ecosystem weekly on a grouped pattern, so `github/codeql-action` bumps would arrive inside a pull request it opens anyway. The real cost of a committed workflow is a forced major roughly every year or two, when a deprecation window closes or the workflow syntax moves — not nothing, but not enough to decide on.

**The decision is about control, and this repository needs none of what a workflow buys.** A committed workflow is worth having when the query suite, the language matrix, path filters or the trigger schedule need to differ from the defaults. None does: the surface is a small TypeScript application, the `default` suite on a `remote` threat model is a reasonable fit, and code scanning has never reported an alert. Writing a workflow to restate the defaults adds a file to maintain in exchange for the ability to change settings nobody wants changed.

**A workflow would not have prevented the problem default setup actually caused**, which is the argument that settles it. Enabling default setup also enabled _AI findings_, a preview feature gated on default setup, which failed on every pull request it ever ran on — and that is a repository setting, not a workflow job, so committing a `codeql.yml` would not have given any say over it. The visibility a workflow buys is visibility into the half that was never the problem.

**AI findings was switched off on 2026-08-16**, once its failures were traced. It generates findings for non-CodeQL languages, and everything this repository is scanned for is already CodeQL-covered, so the feature was returning nothing even in the working case. The setting is not exposed by the API and flipping it does not move `code-scanning/default-setup`'s `updated_at`, so [Security](security.md#ai-findings-is-off-and-leaves-no-trace-that-it-ever-was-on) is the only record that it was ever on — the sharpest instance yet of the class of change [D-260816c](#d-260816c--keep-the-ruleset-free-of-bypass-actors-and-accept-the-wedge-risk) and the release checklist exist to catch.

**Requiring the alert gate was considered and rejected on wedge risk, not on principle.** `CodeQL` — the _Code scanning results_ check — is the only one of the four worth requiring; the `Analyze` jobs report that a scan ran rather than what it found, so requiring those would be a gate in name only. The case for requiring the real one is decent: it already runs on every pull request, costs seconds, and the alert baseline is clean, which is the cheapest moment to lock a baseline in. Against it: the ruleset carries no bypass actors by [D-260816c](#d-260816c--keep-the-ruleset-free-of-bypass-actors-and-accept-the-wedge-risk), so a GitHub-side outage on a required check blocks every merge with no way through — and this surface is visibly churning right now, an AI product having been switched on underneath the repository and broken since. A gate that has never had anything to fire on is not worth that.

**Dismissing a false positive is a change made outside git**, which is the other cost of requiring it: the alert would have to be dismissed in the web console before a merge could proceed, and this repository has a documented history of such changes going unrecorded.

**Revisit when the first real alert appears**, which is the event that would make the gate worth its risk. Nothing needs re-deciding before then.

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

**A cheap path, not an absent one.** `prettier:check` runs `prettier .` across the tree, so Markdown and JSON _are_ checked, and on a documentation-only change it is the only check that applies to what changed — a blanket skip would remove the one thing still worth running. `eslint` and both type-checks cover no Markdown and `css-vars:check` reads `colors.ts`, so all three are gated. Jest cannot be affected by prose either, but it runs regardless: see the resolution below.

**`paths-ignore` was rejected before it was tried.** A workflow filtered out that way never reports, and a required check that never reports leaves a pull request pending forever — so it would silently break the branch protection now in place on `main`. The filter is an `if:` inside the workflow, so the jobs still run, or skip, and still report success. That is the whole reason for the shape, and [D-260816b](#d-260816b--split-ci-into-concurrent-jobs-with-the-classification-in-its-own) relies on the same asymmetry at job granularity.

**The exclusion list is CI's, not Vercel's, and copying would have been the obvious mistake.** Vercel asks whether a change can reach a visitor; CI asks whether a change can affect lint, types, tests or the build. `e2e/` and `playwright.config.ts` are excluded from the deploy ([D-260815a](#d-260815a--give-the-service-worker-its-own-playwright-project-rather-than-unblocking-it-everywhere)) and are precisely the paths whose change _must_ run the browser suite. Verified against real commits rather than reasoned about: replaying the classification, [#173](https://github.com/henetiriki/portfolio/pull/173) takes the full path on `e2e/` alone while Vercel skipped it, and [#166](https://github.com/henetiriki/portfolio/pull/166) takes the full path on `.gitignore` alone — which is in neither list, on both sides, because it decides what the build has to work with.

**One `git diff`, matching `vercel.json`'s shape, and it fails open.** `HEAD^` is the base tip on a pull request — the checked-out ref is the merge commit — and the previous tip on a push to `main`, so a single command covers both events; the checkout carries `fetch-depth: 2` for that parent. Any failure to resolve it exits non-zero and the change is treated as not documentation-only, so the failure mode is a needless full run rather than a missed check. The same direction `vercel.json` chose.

**One consequence was owed to whoever enabled branch protection, and it was paid.** The cheap path originally skipped the Jest run, so no report was uploaded and `codecov/patch` could not post a status at all on a documentation-only pull request — requiring that check would have reintroduced exactly the permanently-pending failure `paths-ignore` was rejected for. The gate was removed before the check was required, so the case never arose.

**Resolved the same day it was raised, and applied on 2026-08-16: the Jest run and the Codecov upload are no longer gated.** Skipping them was this decision's one concession to the roadmap's original shape, written before anyone priced the run — the unit suite takes seconds locally, against a production build and a ~270 MB browser download. It is a few percent of the saving, and paying it removes the branch-protection edge case rather than betting on Codecov's behaviour with no upload. Sequenced onto publication because that is when a required check first existed to be blocked; the shape of the cheap path is otherwise unchanged.

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
