# Contact Feature

The `/contact` page lets a visitor send a message that's emailed to the site owner via Gmail SMTP, with a copy sent back to the sender.

## Client side

- **`pages/contact.tsx`** sets page meta and dynamically imports (`ssr: false`) `ContactForm`.
- **`ContactForm`** (`@components/form`) renders Name/Email/Message via Mantine `TextInput`/`Textarea`, wired through `useMantineForm()`. It also renders a hidden `TextInput name='heuning'` — a honeypot field styled `display: none`, invisible to humans but often auto-filled by bots — Afrikaans for "honey", matching the "honeypot" concept.
- **`useMantineForm`** (`@hooks/useMantineForm.ts`):
  - Uses `@mantine/form`'s `useForm` with client-side validators: `isEmail` for email, `isNotEmpty` for name/message, `validateInputOnBlur: true`.
  - `submitForm` POSTs JSON to `/api/contact`. On `response.ok`, marks `isSubmitted` and resets the form. On failure, reads `{ data: string[] }` (error codes) from the response body and maps each through `errorFromCode` (`@utils/contact.ts`) to a JSX message looked up in `@fixtures/contact`'s `errorMessages`, falling back to a generic error on network/parse failure.
  - After every submit attempt, resets `isSubmitted`/`apiErrors` after a 250ms delay (`finally` block) so the notification effects in `ContactForm` re-fire cleanly on a subsequent submit.
- Notifications: `ContactForm` watches `apiErrors` and `isSubmitted` and shows Mantine `notifications.show(...)` toasts (bottom-center, 6s auto-close) — green "Thanks!" on success, red "Oops!" per error.
- **BotID**: `_app.tsx` registers `<BotIdClient protect={[{ method: 'POST', path: '/api/contact' }]} />`, which instruments the page so the subsequent server-side `checkBotId()` call in `send.ts` can classify the request.

## Server side (`src/server/contact/` + `src/pages/api/contact.ts`)

Request flow in `api/contact.ts`:

1. Read `Submission` (`{ name, email, message, heuning? }`) from `req.body`.
2. `validate(submission)` → array of `ErrorType` codes; if non-empty, respond `400 { data: errors }`.
3. `send(buildMessage(submission))` — email to the owner; on failure respond `500`.
4. `send(buildMessageCopy(submission))` — copy back to the sender; on failure respond `500`.
5. Respond `200 { data: 'Sent successfully' }`.

### Validation (`helpers.ts` → `validate`)

| Check                                                         | Error code                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| Honeypot field (`heuning`) is non-empty                       | `e_spam` — short-circuits immediately, no other checks run   |
| `name` missing                                                | `e_name_required`                                            |
| `name` contains a disallowed character (`< > ^ \| % ( ) & +`) | `e_name_disallowed_chars`                                    |
| `name` contains a URL                                         | flags `hasUrl` (see below)                                   |
| `email` missing                                               | `e_email_required`                                           |
| `email` fails a basic RFC-lite regex                          | `e_email_invalid`                                            |
| `message` missing                                             | `e_message_required`                                         |
| `message` contains a disallowed character                     | `e_message_disallowed_chars`                                 |
| `message` contains a URL                                      | flags `hasUrl`                                               |
| any field flagged `hasUrl`                                    | `e_contains_url` (appended once, after the per-field checks) |

Multiple errors can be returned together (except the honeypot short-circuit); the client renders one toast per code.

### Email construction

- Templates are read once at module load from `src/server/contact/templates/email-template.html` (to the owner) and `email-copy-template.html` (to the sender) via `readFileSync` + `path.join(process.cwd(), ...)`.
- `formatValue(template, args)` does simple `{0}`, `{1}`, … placeholder substitution.
- `buildMessage`: subject `` `Message from {name} | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-template.html` with `{0}=name`, `{1}=email`, `{2}=message` (newlines converted to `<br>`), `replyTo` set to the sender so the owner can reply directly, `to: GMAIL_SENDER_EMAIL`.
- `buildMessageCopy`: subject `` `Thanks for your message | ${CUSTOM_APP_DOMAIN}` ``, HTML body from `email-copy-template.html` with just the sender's name, `to` the sender's own `name <email>`.

### Sending (`send.ts`)

- Calls `checkBotId()` (server-side BotID verification) before sending; if `verification.isBot`, logs and rejects with `{ success: false, error: 'Access denied' }` — **note**: the code calls `reject(...)` inside the executor but does not `return` afterward, so execution falls through and still attempts `transporter.sendMail(...)` even for a detected bot (see the flagged issue below).
- Uses `nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_APP_EMAIL, pass: GMAIL_APP_PASSWORD } }, { from: GMAIL_SENDER_EMAIL })` — a Gmail App Password, not the account's normal password, is required (`GMAIL_APP_PASSWORD`).
- Resolves `{ success: true }` on send, rejects `{ success: false, error }` on failure. Errors are logged with `console.error`.

> **Known rough edge**: `send()`'s `Promise` executor doesn't `return` after either `reject(...)` call — not after the bot-check reject, nor inside the `sendMail` callback's error branch — so execution falls through and the promise can still `resolve({ success: true })` after already having rejected (the first settlement wins per Promise semantics, but the code reads as if both paths run to completion, and a detected bot still triggers `transporter.sendMail(...)`). Separately, `api/contact.ts` calls `send(...)` with a plain `await` and destructures its resolved value — it never wraps the call in `try`/`catch`, so an actual rejection (bot detected, malformed transport config, etc.) would surface as an unhandled promise rejection rather than the intended `500` response. Worth revisiting if bot traffic starts producing unclean logs or unexpected 500s.

## Environment variables used

`CUSTOM_APP_DOMAIN`, `GMAIL_SENDER_EMAIL`, `GMAIL_APP_EMAIL`, `GMAIL_APP_PASSWORD` — see [Environment Variables](environment-variables.md).
