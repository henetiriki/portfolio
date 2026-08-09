# Contact Feature

The `/contact` page lets a visitor send a message that's emailed to the site owner via Gmail SMTP, with a courtesy copy attempted back to the sender.

## Client side

- **`pages/contact.tsx`** sets page meta and renders `ContactForm` directly. The form has no render-time browser dependency, so it is included in the server-rendered page rather than deferred to the client.
- **`ContactForm`** (`@components/form`) renders Name/Email/Message via Mantine `TextInput`/`Textarea`, wired through `useMantineForm()`. It also carries a secondary anti-automation signal; its identifier, detection rule and presentation are intentionally not documented here.
- **`useMantineForm`** (`@hooks/useMantineForm.ts`):
  - Uses `@mantine/form`'s `useForm` with client-side validators: `isEmail` for email, `isNotEmpty` for name/message, `validateInputOnBlur: true`. The visible fields also carry the shared maximum lengths (name 100, email 254, message 5000) as browser constraints; the API independently enforces the same limits.
  - `submitForm` POSTs JSON to `/api/contact`. On `response.ok`, marks `isSubmitted` and resets the form. On failure, runtime-validates `{ data: string[] }` before mapping each code through `errorFromCode` (`@utils/contact.ts`) to a JSX message looked up in `@fixtures/contact`'s `errorMessages`; malformed/network responses fall back to the generic error.
  - After every submit attempt, resets `isSubmitted`/`apiErrors` after a 250ms delay (`finally` block) so the notification effects in `ContactForm` re-fire cleanly on a subsequent submit.
- Notifications: `ContactForm` watches `apiErrors` and `isSubmitted` and shows Mantine `notifications.show(...)` toasts (bottom-center, 6s auto-close) — green "Thanks!" on success, red "Oops!" per error.
- **BotID**: `_app.tsx` registers `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />`, which instruments the page so the subsequent server-side `checkBotId()` call in `api/contact.ts` can classify the request once before any email work begins.

## Server side (`src/server/contact/` + `src/pages/api/contact.ts`)

Request flow in `api/contact.ts`:

1. Reject methods other than `POST` with `405`, set `Allow: POST`, and return the generic public error code array.
2. Runtime-check the request-body shape and maximum field lengths before destructuring/processing it; malformed or oversized bodies receive the same generic array with `400`.
3. `validate(submission)` → array of `ErrorType` codes; if non-empty, respond `400 { data: errors }`.
4. Run server-side request verification once. Rejected requests stop before a transporter is created; verification-service failures receive the generic array with `500`.
5. Create one Nodemailer transporter for the request and reuse it for both messages.
6. `send(transporter, buildMessage(submission))` — email to the owner; on failure log a fixed, redacted server message and respond `500` with the generic array.
7. `send(transporter, buildMessageCopy(submission))` — attempt the courtesy copy. If it fails after owner delivery, log a fixed warning but continue: returning `200` prevents a client retry from duplicating the owner email.
8. Respond `200 { data: 'Sent successfully' }` once owner delivery succeeds.

### Validation (`helpers.ts` → `validate`)

| Check                                                         | Error code                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `name` missing                                                | `e_name_required`                                            |
| `name` contains a disallowed character (`< > ^ \| % ( ) & +`) | `e_name_disallowed_chars`                                    |
| `name` contains a URL                                         | flags `hasUrl` (see below)                                   |
| `email` missing                                               | `e_email_required`                                           |
| `email` fails a basic RFC-lite regex                          | `e_email_invalid`                                            |
| `message` missing                                             | `e_message_required`                                         |
| `message` contains a disallowed character                     | `e_message_disallowed_chars`                                 |
| `message` contains a URL                                      | flags `hasUrl`                                               |
| any field flagged `hasUrl`                                    | `e_contains_url` (appended once, after the per-field checks) |

Multiple field-validation errors can be returned together; the client renders one toast per code. The additional anti-automation checks are intentionally omitted from this table.

### Email construction

- Templates are read once at module load from `src/server/contact/templates/email-template.html` (to the owner) and `email-copy-template.html` (to the sender) via `readFileSync` + `path.join(process.cwd(), ...)`.
- `formatValue(template, args)` does simple `{0}`, `{1}`, … placeholder substitution. Every user-controlled value is HTML-escaped before interpolation; message newlines are converted to `<br>` only after escaping.
- `buildMessage`: subject `` `Message from {name} | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-template.html` with `{0}=name`, `{1}=email`, `{2}=message`, a structured `replyTo` address so the owner can reply directly, and `to: GMAIL_SENDER_EMAIL`.
- `buildMessageCopy`: subject `` `Thanks for your message | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-copy-template.html` with the escaped sender name, and a structured `to` address for the sender.

### Sending (`send.ts`)

- `isContactRequestAllowed()` performs the one server-side BotID verification used by `api/contact.ts`; verification is deliberately kept outside `send()` so two emails do not repeat it.
- `createContactTransporter()` uses `nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_APP_EMAIL, pass: GMAIL_APP_PASSWORD } }, { from: GMAIL_SENDER_EMAIL })` — a Gmail App Password, not the account's normal password, is required (`GMAIL_APP_PASSWORD`). The API creates this once and passes the same transporter into both `send()` calls.
- `send(transporter, message)` resolves `{ success: true }` or rejects `{ success: false, error }` with no fallthrough. The API owns error semantics and uses only fixed, redacted logs; it never logs the submission, message options, transport response or SMTP error detail.
- An owner-send rejection maps to `500 { data: ['e_generic'] }`; a confirmation-send rejection is non-fatal after the owner delivery. Raw transport errors never cross the API boundary.

> **Historical note:** the 2026-08-06 fix first added correct rejection control flow and API error handling. The 2026-08-09 hardening then moved request verification and transport creation out of each individual `send()`, making the two-message sequence explicit and retry-safe in `api/contact.ts`. Both layers are covered by focused regression tests.

## Environment variables used

`CUSTOM_APP_DOMAIN`, `GMAIL_SENDER_EMAIL`, `GMAIL_APP_EMAIL`, `GMAIL_APP_PASSWORD` — see [Environment Variables](environment-variables.md).
