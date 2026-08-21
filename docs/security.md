# Security

The security surface in one place: the response headers, the Content Security Policy and its report endpoint, where bot protection lives, what scans the code, and how secrets are handled. This is a topical doc, so it describes **what exists today** — rationale lives in [Engineering Decisions](decisions.md) and is linked from each section, per [D-260809a](decisions.md#d-260809a--separate-plans-decisions-and-history).

The per-change procedure — what to check in a diff before opening a pull request — is the [release checklist](release-checklist.md#sensitive-information), not this file. **How to report a vulnerability is [`SECURITY.md`](../SECURITY.md)**, at the repository root, which is what GitHub surfaces as the security policy; before it existed GitHub offered this file in its place, which answers a different question.

**What belongs here** is whatever someone auditing the security posture would expect to find in one place: headers, the policy, bot protection, code scanning and secrets handling. Most of that is the running site, and **code scanning is the one repository-side entry** — it earns its place because it is enabled outside the repository entirely, so nothing in the source would otherwise account for it. Implementation that merely touches something sensitive does not belong — email template rendering and escaping stay with [Contact Feature](contact-feature.md).

## Response headers

`next.config.js` sets a fixed `securityHeaders` array on every route through `headers()`, with `source: '/:path*'`:

| Header                      | Value                                          |
| --------------------------- | ---------------------------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options`           | `DENY`                                         |
| `X-Content-Type-Options`    | `nosniff`                                      |
| `X-DNS-Prefetch-Control`    | `on`                                           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              |
| `Content-Security-Policy`   | the policy below                               |

- **`X-XSS-Protection` is deliberately absent.** It is deprecated, no current browser implements it, and its `1; mode=block` value was itself exploitable in legacy browsers. The Content Security Policy is the modern replacement.
- **`nosniff` applies to `/:path*` and cannot be carved out.** Next merges header rules rather than letting a later rule unset an earlier one, which matters when a dev-only warning tempts someone to weaken it — see [Development Workflow](development.md#known-dev-only-console-errors-nextjs-16).

## Content Security Policy

The policy **enforces**, shipping as `Content-Security-Policy`, built from the `contentSecurityPolicyDirectives` map in `next.config.js` so each directive reads as a list rather than one long string. `img-src` is derived from `IMAGE_HOST_PROTOCOL`/`IMAGE_HOST_NAME`, so the remote image host stays in step with `images.remotePatterns` — see [Environment Variables](environment-variables.md).

- **`script-src` and `style-src` both carry `'unsafe-inline'`**, and that is permanent while BotID renders a nonce-less inline script and every page is statically prerendered. What the policy still buys — `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'` and the host allowlists — is unaffected by inline.
- **Only one header ships.** Report-Only was retired rather than kept alongside: two headers apply independently but report indistinguishably, because `src/server/csp/` records neither `disposition` nor which header fired. See [D-260815h](decisions.md#d-260815h--promote-the-policy-to-enforcing-in-one-step).
- **`frame-ancestors 'none'` only started doing anything at promotion.** Safari discards the directive outright in a report-only policy, following [CSP Level 2](https://www.w3.org/TR/CSP2/#directive-frame-ancestors) rather than [Level 3](https://w3c.github.io/webappsec-csp/#directive-frame-ancestors), and logged _"The Content Security Policy directive 'frame-ancestors' is ignored when delivered in a report-only policy"_ on every page until then. **`X-Frame-Options: DENY` above is not redundant** — it is the older, more widely implemented statement of the same rule, it enforced throughout the Report-Only period, and it is the reason promoting this directive carried no risk despite never having been observed in Safari.
- **`report-to` is deliberately absent**; `report-uri /api/csp-report` is what works today, and it matters more now than it did under Report-Only — an enforcing policy's violations are broken pages rather than observations.
- **The service worker is a policy context of its own, and the reason it no longer intercepts cross-origin requests.** A request the worker handles is re-issued with `fetch()` from inside it, and a worker has no `img-src`, `style-src` or `font-src` — every fetch there is judged against `connect-src` alone. Under Serwist's `defaultCache` that applied to every subresource on the site, so Maps sprites permitted by `img-src` and Google Fonts stylesheets permitted by `style-src` were refused once the worker was in control. The worker now caches same-origin requests only; see [D-260815f](decisions.md#d-260815f--cache-only-same-origin-requests-so-the-service-worker-stops-rewriting-the-policy) and [PWA & SEO](pwa-seo.md#progressive-web-app). Violations reported with `document-uri: /sw.js` are how this presents.
- **`script-src` carries `'wasm-unsafe-eval'`** for the WebAssembly module the Maps SDK compiles, on `/travel` and inside a blob worker it creates. `'unsafe-eval'` would grant far more than the violation asks for.
- **`connect-src` names its hosts one at a time, which is what hid `mapsresources-pa.googleapis.com`.** `img-src` carries `https://*.googleapis.com`, so the Maps style-table request was allowed for images and refused for `connect`. The host is now listed explicitly rather than the directive widened to a wildcard.
- **`style-src https://fonts.googleapis.com` and `font-src https://fonts.gstatic.com` survive the font vendoring**, and that is now evidenced rather than assumed. Nothing under `src/`, `service-worker/` or `public/` references either host after [D-260814a](decisions.md#d-260814a--vendor-what-the-build-cannot-proceed-without), but the Maps SDK requests three `fonts.googleapis.com` stylesheets of its own — Roboto/Google Sans, Google Sans Text and Material Symbols — confirmed in production reports on `/travel`. Removing either entry would break the map's controls.
- The `'unsafe-inline'` and `report-to` decisions above, and the provenance of every non-obvious source in the allowlist, are recorded in [D-260814c](decisions.md#d-260814c--ship-the-content-security-policy-report-only-and-accept-unsafe-inline).
- **The browser suite asserts the enforcing header is present and Report-Only is absent**, on every content route, so a silent reversion is caught. It also pins `'wasm-unsafe-eval'` and `https://mapsresources-pa.googleapis.com` specifically: both were observed violations before they were entries, and under enforcement losing either is a broken map rather than a report.

### Violation reporting (`/api/csp-report`)

- `POST` only; anything else gets `405` with `Allow: POST`. Responses carry `Cache-Control: private, no-store`.
- Next's body parser is disabled for the route and the body is read raw, because `report-uri` posts `application/csp-report`, which the parser does not treat as JSON.
- The body is capped at **16 KB**, streamed and counted as it arrives; an oversized report is answered `413` rather than buffered.
- `src/server/csp/` parses the `report-uri` shape defensively (every field falls back to `'unknown'`), drops reports whose blocked URI or source file uses an extension scheme (`chrome-extension:`, `moz-extension:`, `safari-extension:`, `safari-web-extension:`), and logs one `console.warn` line per surviving violation. Everything accepted answers `204`.
- **The endpoint is unauthenticated by necessity.** Browsers post reports without JavaScript, so no token can be required and BotID cannot sign them. The handling above is shaped around that constraint, and the posture is judged proportionate for a personal site.
- **Each field is stripped of control characters and capped at 256 bytes before it is logged.** An unauthenticated `POST` body is otherwise attacker-controlled all the way into the runtime logs, and a `\n` there would let a forged report splice a fake line into the record these logs are now the whole of. `logViolation` also logs the violation as one `JSON.stringify`d line rather than an interpolated string, so the log stays structured and a stray delimiter in a field can't be mistaken for the log's own.
- **Violations land in the Vercel runtime logs**, which are a rolling buffer measured in hours to days. Nothing notifies anyone and nothing retains them. That was worked around for the observation window by emailing each violation; the window closed with promotion and `src/server/csp-mail/` was deleted with it, so the logs are the whole record again — see [D-260815b](decisions.md#d-260815b--email-content-security-policy-violations-for-the-observation-window) for what it did and [D-260815h](decisions.md#d-260815h--promote-the-policy-to-enforcing-in-one-step) for why it went.
- **Request volume is unbounded, and that gap is accepted rather than closed.** The endpoint has no rate limit: the Vercel Hobby plan this site runs on has no edge/WAF rate limiting to apply, and a weaker alternative was already tried and rejected for this endpoint's now-deleted mail path. See [D-260821c](decisions.md#d-260821c--accept-the-missing-rate-limit-on-apicsp-report) for the full reasoning and what would change it.

### Failure modes to watch

- **A header value Next silently drops.** `headers()` uses `source: '/:path*'`, and Next compiles values as path-to-regexp templates when the source carries a parameter. A value that trips that step is dropped from the response with no build warning — and "fixing" it by escaping the colons ships literal backslashes no browser can parse. The page looks healthy in both cases.
- **The console is not the signal.** A Maps `gen_204?csp_test=true` probe on `/travel` already fails as `ERR_BLOCKED_BY_CLIENT` for anyone running a client-side blocker, with no policy deployed at all, so a blocked probe cannot distinguish this policy from the visitor's own blocker. Read the reports.
- **A violation raised inside the service worker never reaches the page console.** Chrome puts it behind Application → Service Workers → inspect, Firefox behind `about:debugging`, Safari behind Develop → Service Workers. Nine of the thirteen violations in the observation window were of this kind, so console-only checking would have found four and declared the policy nearly clean.

### Browser coverage

`e2e/security-headers.spec.ts` asserts that the enforcing header reaches every content route, that Report-Only is absent so the two never ship together, that the inline-independent directives and the real origins survive unescaped, and that `/api/csp-report` answers a real report body with `204`. See [Browser regression suite](development.md#browser-regression-suite).

`e2e/service-worker.spec.ts` is the only thing that exercises `worker-src`, by registering a real service worker under the deployed policy — see [D-260815a](decisions.md#d-260815a--give-the-service-worker-its-own-playwright-project-rather-than-unblocking-it-everywhere). It asserts nothing about the policy directly; the evidence is that the run produces no violation.

## Bot protection

`botid` (Vercel BotID) protects the contact form specifically — `_app.tsx` instruments `POST /api/contact` client-side and `api/contact.ts` calls `checkBotId()` once per request before any mail work begins. It is documented with the rest of that flow in [Contact Feature](contact-feature.md), which would read as half a story without it; the posture it accepts is [D-260811b](decisions.md#d-260811b--accept-the-contact-endpoints-automation-only-protection).

A rejected request never reaches the mail transport. The form also carries a secondary anti-automation signal, layered with server-side validation: its identifier, detection rule and presentation are intentionally undocumented, here and everywhere else, including [`llms.txt`](pwa-seo.md#ai-agent-discovery-llmstxt) — no single mechanism is treated as sufficient on its own.

## Code scanning (CodeQL)

**Code scanning runs from GitHub's default setup, not from a workflow file.** `ci.yml` is the only thing in `.github/workflows/`, so nothing in the repository explains why CodeQL check runs appear on every pull request — which is the reason this section exists. It is configured for the `default` query suite on a `remote` threat model, weekly, on standard runners. Read the live configuration rather than trusting this paragraph:

```bash
gh api repos/henetiriki/portfolio/code-scanning/default-setup
```

**Three check runs come from this, and only one of them is a gate.** The names are close enough to be confused, and requiring the wrong one would buy nothing:

| Check run                                              | Posted by                  | What it means                                                                     |
| ------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------- |
| `Analyze (javascript-typescript)`, `Analyze (actions)` | `github-actions`           | The scans themselves. Green means the analysis **ran**, not that it found nothing |
| `CodeQL`, shown as _Code scanning results / CodeQL_    | `github-advanced-security` | **The alert gate** — "No new alerts in code changed by this pull request"         |

A fourth, `github-advanced-security`, ran until 2026-08-16 and is covered below.

Four languages are configured (`actions`, `javascript`, `javascript-typescript`, `typescript`) but only two analyses run, because GitHub collapses the JavaScript/TypeScript trio into a single `javascript-typescript` job.

**None of them is a required check, deliberately** — see [D-260816j](decisions.md#d-260816j--keep-codeql-on-default-setup-and-leave-it-unrequired).

### AI findings is off, and leaves no trace that it ever was on

**_AI findings_ is a preview feature, disabled on 2026-08-16.** It lives in the repository's code security settings — not in a workflow, which is why nothing in `.github/` accounts for it — and is gated on CodeQL default setup being enabled, so switching default setup on is what switched this on too.

**It failed on every pull request it ever ran on**, from the day it appeared until it was turned off. It ran as a `dynamic` workflow with no file behind it, at path `dynamic/agents/github-advanced-security`, and the cause was on GitHub's side rather than anything this repository did:

```
CAPIError: 400 The requested model is not supported.
```

The job also reported `COPILOT_PERMISSION_GATE_REASON: not_assigned`. Read one of the archived failures with `gh api repos/henetiriki/portfolio/actions/jobs/<id>/logs --allow-escape-sequences`.

**Turning it off costs no coverage here**, which is what made it an easy call rather than a trade: the feature generates findings for _non-CodeQL languages_, and every language this repository is scanned for — JavaScript, TypeScript, Actions — is one CodeQL already covers. What was left for it was CSS, JSON, YAML and Markdown.

**It was never required, so it blocked nothing. The cost was habituation** — a permanent red X one row from the CodeQL alert gate, training the eye to skim past exactly where a real finding would appear.

**Nothing anywhere records this change, which is why it is written here.** The toggle is absent from `code-scanning/default-setup`, and that endpoint's `updated_at` did not move when the setting was flipped, so there is no trace in git, in the API, or in the ruleset history. **The only way to verify the state is the absence of runs on a new pull request**, which is how the disable was confirmed — [#198](https://github.com/henetiriki/portfolio/pull/198) produced no `github-advanced-security` check where every pull request before it had. To check it again:

```bash
gh api "repos/henetiriki/portfolio/actions/runs?per_page=100" --jq '[.workflow_runs[] | select(.path=="dynamic/agents/github-advanced-security")] | .[0:3] | .[] | {n: .display_title, at: .created_at}'
```

## Secrets and credentials

- **Real secrets live in `.env*.local`, which is gitignored, and in the Vercel dashboard.** `.env` and `.env.test` are tracked and hold only non-secret host config or dummy values; `.env.test` exists so `next.config.js` validates under Jest, not as a source of credentials. See [Environment Variables](environment-variables.md).
- **`NEXT_PUBLIC_*` inlines a value into the client bundle at build time**, so adding one is publishing it. The same applies to values added to the CI workflow's `env` block, since `ci.yml` is committed.
- **The repository is public as of 2026-08-16, so history is readable, not only the tip.** It was verified free of secrets before publication — every `.env*` blob that has ever existed, plus a search for the common credential and key formats. **Secret scanning and push protection are enabled**, so a credential is now blocked at the push rather than found later. If something sensitive ever does land, rotation is the fix: a later commit removing it does not remove it from history.
- Each of these is a line item on the [release checklist](release-checklist.md#sensitive-information), to be run against every diff rather than only security-looking ones.

## Accepted exposure

**The Cloudinary cloud name is unavoidably public**, appearing in every delivery URL and inlined in the shipped client bundle. **Strict transformations and the `fetch` restriction are both enabled**, so the name no longer buys anything: a transformation the account has not already produced is refused, and the account cannot be used to proxy arbitrary remote URLs. What is left is delivery of assets this site already publishes.

- **Enabling strict transformations costs this site nothing, which is why it can stay on.** No transformation parameters appear anywhere in `src/` or `next.config.js` — delivery URLs carry only a version and a public ID. `FixedBackground` hands that URL to Next's `<Image>`, so the optimiser fetches the untransformed original and does the resizing itself; strict mode still serves originals. There is nothing to add to the allowed-referral-domain list either, and adding one would weaken the control rather than support it, since a `Referer` header is trivially forged.
- **Derived assets created before the control was enabled still serve.** Strict mode blocks the creation of new derived assets, not delivery of existing ones, so it closes the vector without invalidating anything already cached.

**The Google Maps API key ships in the client bundle, and an HTTP referrer restriction is the control that makes that acceptable.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is inlined at build time — see [Environment Variables](environment-variables.md) — so it is readable by anyone loading `/travel`, and the restriction rather than secrecy is what stops it being used elsewhere. **The allowed origins are deliberately not reproduced here**, in this or any other file: the repository is public, and a list of exactly which referrers a key accepts is a list of exactly which ones to forge. Read it in the Google Cloud console when you need it.

- **Local development origins are on it, and each one is a real widening.** A `localhost` referrer is trivially forged by anything not running in a browser, so every entry added for convenience costs a little of what the restriction buys. Judged proportionate for a key whose quota is the only thing at stake, but the entries are worth periodically pruning rather than accumulating.
- **One was added on 2026-08-16** so the map renders under the browser suite's port as well as `next dev`'s, which reverses the loss [D-260816g](decisions.md#d-260816g--serve-the-browser-suite-on-3001-and-leave-3000-to-next-dev) had accepted. Recorded because a console change produces no commit to drag the documentation along behind it.

**The Codecov graph token in the README badge URL is a read token and is meant to be committed.** It authorises rendering the coverage graph for a repository whose coverage is already public, and it is not the upload token — uploads from CI are authenticated by GitHub's OIDC identity, so there is no upload token in the repository to confuse it with. It is called out here because a `token=` in a committed URL is exactly the shape of thing that looks like a leak on a later audit, and answering that question from the URL alone is not possible.

The general form of that check — asking what an anonymous caller can _do_ with a public endpoint, not only what they can read — is on the [release checklist](release-checklist.md#sensitive-information) for every new third-party host.
