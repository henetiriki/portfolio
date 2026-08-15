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
- **`report-to` is deliberately absent**; `report-uri /api/csp-report` is what works today.
- Both of the above, and the provenance of every non-obvious source in the allowlist, are recorded in [D-260814c](decisions.md#d-260814c--ship-the-content-security-policy-report-only-and-accept-unsafe-inline).
- **Promotion to an enforcing header is tracked on the [roadmap](roadmap.md#performance-seo--platform-polish)**, along with the known allowlist gaps found so far. The browser suite asserts the enforcing header is _absent_, so promotion cannot happen by accident.

### Violation reporting (`/api/csp-report`)

- `POST` only; anything else gets `405` with `Allow: POST`. Responses carry `Cache-Control: private, no-store`.
- Next's body parser is disabled for the route and the body is read raw, because `report-uri` posts `application/csp-report`, which the parser does not treat as JSON.
- The body is capped at **16 KB**, streamed and counted as it arrives; an oversized report is answered `413` rather than buffered.
- `src/server/csp/` parses the `report-uri` shape defensively (every field falls back to `'unknown'`), drops reports whose blocked URI or source file uses an extension scheme (`chrome-extension:`, `moz-extension:`, `safari-extension:`, `safari-web-extension:`), and logs one `console.warn` line per surviving violation. Everything accepted answers `204`.
- **The endpoint is unauthenticated and therefore spammable.** Browsers post reports without JavaScript, so no token can be required and BotID cannot sign them. The size cap, the defensive parse and the log-only handling are the whole mitigation, judged proportionate for a personal site.
- **Violations land in the Vercel runtime logs**, which are a rolling buffer measured in hours to days. Nothing notifies anyone, and nothing retains them; emailing them for the duration of the observation window is open work on the [roadmap](roadmap.md#performance-seo--platform-polish).

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
