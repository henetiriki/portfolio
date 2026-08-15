# Security

The site's security surface in one place: the response headers, the Content Security Policy and its report endpoint, where bot protection lives, and how secrets are handled. This is a topical doc, so it describes **what exists today** — rationale lives in [Engineering Decisions](decisions.md) and is linked from each section, per [D-260809a](decisions.md#d-260809a--separate-plans-decisions-and-history).

The per-change procedure — what to check in a diff before opening a pull request — is the [release checklist](release-checklist.md#sensitive-information), not this file.

**What belongs here** is whatever someone auditing the site's security posture would expect to find in one place: headers, the policy, bot protection and secrets handling. Implementation that merely touches something sensitive does not — email template rendering and escaping stay with [Contact Feature](contact-feature.md).

## Response headers

`next.config.js` sets a fixed `securityHeaders` array on every route through `headers()`, with `source: '/:path*'`:

| Header                                | Value                                          |
| ------------------------------------- | ---------------------------------------------- |
| `Strict-Transport-Security`           | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options`                     | `DENY`                                         |
| `X-Content-Type-Options`              | `nosniff`                                      |
| `X-DNS-Prefetch-Control`              | `on`                                           |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`              |
| `Content-Security-Policy-Report-Only` | the policy below                               |

- **`X-XSS-Protection` is deliberately absent.** It is deprecated, no current browser implements it, and its `1; mode=block` value was itself exploitable in legacy browsers. The Content Security Policy is the modern replacement.
- **`nosniff` applies to `/:path*` and cannot be carved out.** Next merges header rules rather than letting a later rule unset an earlier one, which matters when a dev-only warning tempts someone to weaken it — see [Development Workflow](development.md#known-dev-only-console-errors-nextjs-16).

## Content Security Policy

The policy ships as `Content-Security-Policy-Report-Only`, built from the `contentSecurityPolicyDirectives` map in `next.config.js` so each directive reads as a list rather than one long string. `img-src` is derived from `IMAGE_HOST_PROTOCOL`/`IMAGE_HOST_NAME`, so the remote image host stays in step with `images.remotePatterns` — see [Environment Variables](environment-variables.md).

- **`script-src` and `style-src` both carry `'unsafe-inline'`**, and that is permanent while BotID renders a nonce-less inline script and every page is statically prerendered. What the policy still buys — `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'` and the host allowlists — is unaffected by inline.
- **While the policy is Report-Only, none of those directives protect anything; they are observations.** That is what Report-Only means, and it is worth stating because the bullet above reads as a list of active defences. **`frame-ancestors 'none'` is the strongest case**: Safari refuses it outright in a report-only policy — logging _"The Content Security Policy directive 'frame-ancestors' is ignored when delivered in a report-only policy"_ on every page — so it neither blocks nor reports there. That message is expected and permanent until promotion, not a defect. Framing is actually prevented by `X-Frame-Options: DENY` above, which is why removing that header is not a safe cleanup even though CSP nominally supersedes it. Safari follows [CSP Level 2](https://www.w3.org/TR/CSP2/#directive-frame-ancestors) here; [CSP Level 3](https://w3c.github.io/webappsec-csp/#directive-frame-ancestors) only requires the directive to be ignored inside a `meta` element.
- **`report-to` is deliberately absent**; `report-uri /api/csp-report` is what works today.
- **The service worker is a policy context of its own, and the reason it no longer intercepts cross-origin requests.** A request the worker handles is re-issued with `fetch()` from inside it, and a worker has no `img-src`, `style-src` or `font-src` — every fetch there is judged against `connect-src` alone. Under Serwist's `defaultCache` that applied to every subresource on the site, so Maps sprites permitted by `img-src` and Google Fonts stylesheets permitted by `style-src` were refused once the worker was in control. The worker now caches same-origin requests only; see [D-260815f](decisions.md#d-260815f--cache-only-same-origin-requests-so-the-service-worker-stops-rewriting-the-policy) and [PWA & SEO](pwa-seo.md#progressive-web-app). Violations reported with `document-uri: /sw.js` are how this presents.
- **`script-src` carries `'wasm-unsafe-eval'`** for the WebAssembly module the Maps SDK compiles, on `/travel` and inside a blob worker it creates. `'unsafe-eval'` would grant far more than the violation asks for.
- **`connect-src` names its hosts one at a time, which is what hid `mapsresources-pa.googleapis.com`.** `img-src` carries `https://*.googleapis.com`, so the Maps style-table request was allowed for images and refused for `connect`. The host is now listed explicitly rather than the directive widened to a wildcard.
- **`style-src https://fonts.googleapis.com` and `font-src https://fonts.gstatic.com` survive the font vendoring**, and that is now evidenced rather than assumed. Nothing under `src/`, `service-worker/` or `public/` references either host after [D-260814a](decisions.md#d-260814a--vendor-what-the-build-cannot-proceed-without), but the Maps SDK requests three `fonts.googleapis.com` stylesheets of its own — Roboto/Google Sans, Google Sans Text and Material Symbols — confirmed in production reports on `/travel`. Removing either entry would break the map's controls.
- The `'unsafe-inline'` and `report-to` decisions above, and the provenance of every non-obvious source in the allowlist, are recorded in [D-260814c](decisions.md#d-260814c--ship-the-content-security-policy-report-only-and-accept-unsafe-inline).
- **Promotion to an enforcing header is tracked on the [roadmap](roadmap.md#performance-seo--platform-polish)**, along with the known allowlist gaps found so far. The browser suite asserts the enforcing header is _absent_, so promotion cannot happen by accident.

### Violation reporting (`/api/csp-report`)

- `POST` only; anything else gets `405` with `Allow: POST`. Responses carry `Cache-Control: private, no-store`.
- Next's body parser is disabled for the route and the body is read raw, because `report-uri` posts `application/csp-report`, which the parser does not treat as JSON.
- The body is capped at **16 KB**, streamed and counted as it arrives; an oversized report is answered `413` rather than buffered.
- `src/server/csp/` parses the `report-uri` shape defensively (every field falls back to `'unknown'`), drops reports whose blocked URI or source file uses an extension scheme (`chrome-extension:`, `moz-extension:`, `safari-extension:`, `safari-web-extension:`), and logs one `console.warn` line per surviving violation. Everything accepted answers `204`.
- **The endpoint is unauthenticated and therefore spammable.** Browsers post reports without JavaScript, so no token can be required and BotID cannot sign them. The size cap, the defensive parse and the log-only handling are the whole mitigation, judged proportionate for a personal site.
- **Violations land in the Vercel runtime logs**, which are a rolling buffer measured in hours to days. Nothing notifies anyone and nothing retains them, which is what the emailing below exists to work around.

### Emailing violations (temporary)

A diagnostic for the Report-Only observation window, not a feature: `src/server/csp-mail/` reuses the contact form's Nodemailer transport to email surviving violations so they outlive the log buffer. It is reached by a single call in `/api/csp-report` and is meant to be deleted with the window — see [D-260815b](decisions.md#d-260815b--email-content-security-policy-violations-for-the-observation-window).

- **Off unless `CSP_VIOLATION_EMAILS` is exactly `true`.** Anything else, including absent, is off, so preview deployments and both test environments are off by default. It is read at module load, so switching it on Vercel needs a redeploy. See [Environment Variables](environment-variables.md).
- **Recipient and subject are fixed by code**, not configured: the address is `GMAIL_SENDER_EMAIL` with a `+csp` tag inserted before the `@`, and every subject starts `[CSP]`, so a mail filter can key on the recipient rather than pattern-matching a subject. The deployed value is the display-name form (`Name <addr@host>`), so the tag lands inside the angle brackets and the result stays a valid address.
- **Mail is plain text, and every field is single-lined and truncated before use.** Directives, blocked URIs and document URIs all arrive in an unauthenticated request body, and one of them reaches a mail header — a report carrying `\r\n` would otherwise be an injection route. No HTML is rendered, so there is no escaping question at all.
- **One email per report, because a `report-uri` post carries exactly one violation.** The parser returns a list regardless, so the mail builder takes one, but nothing batches: the subject names the violation the report describes. A `report-to` batch would degrade gracefully rather than being handled — the subject would name the first and the body would carry all of them.
- **Deduplication and the per-instance cap of 20 emails are noise control, not a defence** — both are module-scope state that a scale-out resets, so they only stop one real page load producing forty emails. Past the cap the endpoint logs and stops mailing, saying so once.
- **A delivery failure is logged with its cause and swallowed.** The endpoint still answers `204`, since a browser has nothing useful to do with a mail error. The cause is logged rather than dropped because the silent version is indistinguishable from a policy that is simply not being violated — which is the one conclusion this whole mechanism exists to support.
- **The Gmail quota is shared with the contact form**, which is the accepted risk recorded in the decision.

### Failure modes to watch

- **A header value Next silently drops.** `headers()` uses `source: '/:path*'`, and Next compiles values as path-to-regexp templates when the source carries a parameter. A value that trips that step is dropped from the response with no build warning — and "fixing" it by escaping the colons ships literal backslashes no browser can parse. The page looks healthy in both cases.
- **The console is not the signal.** A Maps `gen_204?csp_test=true` probe on `/travel` already fails as `ERR_BLOCKED_BY_CLIENT` for anyone running a client-side blocker, with no policy deployed at all, so a blocked probe cannot distinguish this policy from the visitor's own blocker. Read the reports.

### Browser coverage

`e2e/security-headers.spec.ts` asserts that the Report-Only header reaches every content route, that the enforcing header is absent, that the inline-independent directives and the real origins survive unescaped, and that `/api/csp-report` answers a real report body with `204`. See [Browser regression suite](development.md#browser-regression-suite).

`e2e/service-worker.spec.ts` is the only thing that exercises `worker-src`, by registering a real service worker under the deployed policy — see [D-260815a](decisions.md#d-260815a--give-the-service-worker-its-own-playwright-project-rather-than-unblocking-it-everywhere). It asserts nothing about the policy directly; the evidence is that the run produces no violation.

## Bot protection

`botid` (Vercel BotID) protects the contact form specifically — `_app.tsx` instruments `POST /api/contact` client-side and `api/contact.ts` calls `checkBotId()` once per request before any mail work begins. It is documented with the rest of that flow in [Contact Feature](contact-feature.md), which would read as half a story without it; the posture it accepts is [D-260811b](decisions.md#d-260811b--accept-the-contact-endpoints-automation-only-protection).

A rejected request never reaches the mail transport. The form also carries a secondary anti-automation signal, layered with server-side validation: its identifier, detection rule and presentation are intentionally undocumented, here and everywhere else, including [`llms.txt`](pwa-seo.md#ai-agent-discovery-llmstxt) — no single mechanism is treated as sufficient on its own.

## Secrets and credentials

- **Real secrets live in `.env*.local`, which is gitignored, and in the Vercel dashboard.** `.env` and `.env.test` are tracked and hold only non-secret host config or dummy values; `.env.test` exists so `next.config.js` validates under Jest, not as a source of credentials. See [Environment Variables](environment-variables.md).
- **`NEXT_PUBLIC_*` inlines a value into the client bundle at build time**, so adding one is publishing it. The same applies to values added to the CI workflow's `env` block, since `ci.yml` is committed.
- **The repository is private today and is intended to become public**, which makes history the thing to check rather than the tip — see the [roadmap](roadmap.md#testing--automation). If anything sensitive ever was committed, rotation is the fix; a later commit removing it does not remove it from history.
- Each of these is a line item on the [release checklist](release-checklist.md#sensitive-information), to be run against every diff rather than only security-looking ones.

## Accepted exposure

**The Cloudinary cloud name is unavoidably public.** It appears in every delivery URL and is already inlined in the shipped client bundle, so anyone can request arbitrary on-the-fly transformations and burn transformation credits. That is a billing-abuse exposure, not a data one, and it exists today regardless of repository visibility. Enabling strict transformations and restricting `fetch` delivery is pre-publish work on the [roadmap](roadmap.md#testing--automation).

The general form of that check — asking what an anonymous caller can _do_ with a public endpoint, not only what they can read — is on the [release checklist](release-checklist.md#sensitive-information) for every new third-party host.
