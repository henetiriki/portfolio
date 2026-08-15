# Engineering Decisions

This log records durable choices whose rationale is useful beyond the change that introduced them. It is intentionally selective: current implementation details belong in the topical documentation, completed work belongs in [Project History](project-history.md), and unfinished work belongs in the [Roadmap](roadmap.md).

## Identifiers

Each decision is identified by the date it was decided, in the form `D-YYMMDD` plus a letter: `D-260814a`, `D-260814b`. The date is the one recorded in `**Decided:**`, never the merge date, so a rebase cannot change an identifier. The letter is always present, even when a date holds only one decision, and orders decisions within that date by the order they merged.

To mint one: take your decision date, look for that date already in this file, and take the next free letter. Nothing needs checking against other branches, and nothing is ever renumbered.

Entries are newest first. Two branches adding a decision still collide textually at the top of the file; the resolution is to keep both, newest first, and for the same date put the later-merged one above — which is how [Project History](project-history.md) already resolves. See [D-260814d](#d-260814d--identify-decisions-by-date-rather-than-by-sequence).

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

The endpoint is unauthenticated and therefore spammable. It is capped at 16 KB per request, parses defensively and only writes a log line, which is judged proportionate for a personal site — the same posture as [D-260811b](#d-260811b--accept-the-contact-endpoints-automation-only-protection).

## D-260814b — Enforce shell hygiene with a hook rather than a convention

- **Status:** Accepted
- **Decided:** 2026-08-14

[`AGENTS.md`](../AGENTS.md) has asked agents not to chain independent commands with `&&` or `;` since the permission allowlist was written, because that allowlist matches the _entire_ command string: a chained command can never match a narrow rule, so every chain becomes a permission prompt, and a chain that opens with an allowlisted command carries whatever follows it past the same review.

That instruction is advisory, and compliance proved unreliable across sessions — the rule is only as good as the model's discipline in the moment, which is exactly the kind of guarantee an instruction file cannot give. Hooks are different: the harness runs them, so a `PreToolUse` hook on `Bash` in `.claude/settings.json` refuses the command whether or not the model remembers the convention.

The check is a single `jq` program held inline in the settings file. It prints nothing when the command is clean, which the harness reads as "no opinion", and a `permissionDecision: "deny"` with a reason otherwise, which is fed back to the model so it reissues the calls separately. Inline rather than a script under `scripts/`, so there is no path resolution to get wrong in a worktree and nothing to keep in step with the settings file.

One limit is deliberate:

- **It is a textual test, not a shell parse.** A chain operator anywhere in the string is refused, including inside quotes — `find … -exec … \;` and `grep 'a;b'` are both casualties. Parsing properly would mean a shell grammar inside a hook to save a handful of commands a year, which are in any case easy to run by hand or restructure as a pipeline. Genuine pipelines are untouched: a single `|` is not part of the pattern.

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
