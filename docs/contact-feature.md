# Contact Feature

The `/contact` page lets a visitor send a message that's emailed to the site owner via Gmail SMTP, with a copy sent back to the sender.

## Client side

- **`pages/contact.tsx`** sets page meta and dynamically imports (`ssr: false`) `ContactForm`.
- **`ContactForm`** (`@components/form`) renders Name/Email/Message via Mantine `TextInput`/`Textarea`, wired through `useMantineForm()`. It also carries a secondary anti-automation signal; its identifier, detection rule and presentation are intentionally not documented here.
- **`useMantineForm`** (`@hooks/useMantineForm.ts`):
  - Uses `@mantine/form`'s `useForm` with client-side validators: `isEmail` for email, `isNotEmpty` for name/message, `validateInputOnBlur: true`.
  - `submitForm` POSTs JSON to `/api/contact`. On `response.ok`, marks `isSubmitted` and resets the form. On failure, runtime-validates `{ data: string[] }` before mapping each code through `errorFromCode` (`@utils/contact.ts`) to a JSX message looked up in `@fixtures/contact`'s `errorMessages`; malformed/network responses fall back to the generic error.
  - After every submit attempt, resets `isSubmitted`/`apiErrors` after a 250ms delay (`finally` block) so the notification effects in `ContactForm` re-fire cleanly on a subsequent submit.
- Notifications: `ContactForm` watches `apiErrors` and `isSubmitted` and shows Mantine `notifications.show(...)` toasts (bottom-center, 6s auto-close) — green "Thanks!" on success, red "Oops!" per error.
- **BotID**: `_app.tsx` registers `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />`, which instruments the page so the subsequent server-side `checkBotId()` call in `send.ts` can classify the request.

## Server side (`src/server/contact/` + `src/pages/api/contact.ts`)

Request flow in `api/contact.ts`:

1. Reject methods other than `POST` with `405`, set `Allow: POST`, and return the generic public error code array.
2. Runtime-check the request-body shape before destructuring it; malformed bodies receive the same generic array with `400`.
3. `validate(submission)` → array of `ErrorType` codes; if non-empty, respond `400 { data: errors }`.
4. `send(buildMessage(submission))` — email to the owner; on failure log a redacted server message and respond `500` with the generic array.
5. `send(buildMessageCopy(submission))` — copy back to the sender; currently the same `500` behaviour if it fails.
6. Respond `200 { data: 'Sent successfully' }`.

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

> **Known hardening work:** the first 2026-08-09 slice removed PII/transport leakage and added method, body-shape and response-contract guards. Field limits/template escaping, retry-safe two-message semantics, transport reuse and the defense-in-depth review remain. Operational details of the anti-automation finding are deliberately omitted from public documentation; see the scoped [roadmap item](roadmap.md#security-reliability--accessibility).

### Email construction

- Templates are read once at module load from `src/server/contact/templates/email-template.html` (to the owner) and `email-copy-template.html` (to the sender) via `readFileSync` + `path.join(process.cwd(), ...)`.
- `formatValue(template, args)` does simple `{0}`, `{1}`, … placeholder substitution.
- `buildMessage`: subject `` `Message from {name} | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-template.html` with `{0}=name`, `{1}=email`, `{2}=message` (newlines converted to `<br>`), `replyTo` set to the sender so the owner can reply directly, `to: GMAIL_SENDER_EMAIL`.
- `buildMessageCopy`: subject `` `Thanks for your message | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-copy-template.html` with just the sender's name, `to` the sender's own `name <email>`.

### Sending (`send.ts`)

- Calls `checkBotId()` (server-side BotID verification) before sending; if `verification.isBot`, logs and rejects with `{ success: false, error: 'Access denied' }` and returns immediately — `transporter.sendMail(...)` is never reached for a detected bot.
- Uses `nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_APP_EMAIL, pass: GMAIL_APP_PASSWORD } }, { from: GMAIL_SENDER_EMAIL })` — a Gmail App Password, not the account's normal password, is required (`GMAIL_APP_PASSWORD`).
- Resolves `{ success: true }` on send and rejects `{ success: false, error }` on failure (with no fallthrough). Server logs use fixed, redacted messages and do not include the submission, message options, transport response or SMTP error detail.
- `api/contact.ts` catches either send rejection and maps it to `500 { data: ['e_generic'] }`; raw transport errors never cross the API boundary.

> **Fixed 2026-08-06**: this used to have two bugs — `send()`'s `Promise` executor was missing `return` after both `reject(...)` calls (so a detected bot still triggered `transporter.sendMail(...)`, and a send error could still resolve after already rejecting), and `api/contact.ts` called `send(...)` with a bare `await` and no `try`/`catch`, so a rejection would have surfaced as an unhandled promise rejection instead of a `500`. Both are fixed and covered by regression tests in `server/contact/__tests__/send.test.ts` (asserts `createTransport` is never called for a detected bot) and `src/__tests__/pages/api/contact.test.ts`.

## Environment variables used

`CUSTOM_APP_DOMAIN`, `GMAIL_SENDER_EMAIL`, `GMAIL_APP_EMAIL`, `GMAIL_APP_PASSWORD` — see [Environment Variables](environment-variables.md).
