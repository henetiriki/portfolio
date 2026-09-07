# Replace the contact form's URL parser with a URL detector

## Context

- `src/server/contact/helpers.ts` carried a URL matcher under a bare `// eslint-disable-next-line security/detect-unsafe-regex`. It ran server-side on `name` and `message` from the public contact form.
- The rule's finding was structurally correct. `(\/?[^\s?]*\/)*` is a starred group wrapping a starred character class — star height 2 — which is what `safe-regex` reports.
- Its only consumer read a boolean. `containsUrl` returned `URL_REGEX.test(value)`; the caller set `hasUrl` and pushed `e_contains_url`. All nine capture groups were unused.
- `(?:www.)?` had an unescaped dot, so that clause matched any character.
- The pattern had no `i` flag, so `HTTPS://` was not detected.
- This is a spam heuristic rather than a validator or a security boundary. A URL that slips past costs one unwanted message.

## Decision

Replace the pattern with `/(?:https?|ftp):\/\/[^\s/]/i` — scheme, `://`, and the first character of a host — and delete the suppression rather than write it a reason.

## Status

Accepted, 2026-09-07.

## Consequences

**The measurement did not find the blowup the rule implies, and that is worth recording rather than quietly dropping.** No input was found that made the old pattern behave superlinearly: a hand-built family of adversarial shapes, a 200 000-string random fuzz, and a hill-climb from its worst result all stayed flat. The reason is structural — every clause after `(\/?[^\s?]*\/)*` is optional, so once the scheme and host match, the first greedy path succeeds and the nested star is never forced to backtrack. Reachable cost was linear in input length, and `isWithinContactFieldLimits` caps a message at 5000 characters before `validate` runs, so the worst observed case at that limit was 0.033 ms. Anyone re-deriving this from the rule name alone will spend the same afternoon.

**Why not keep the pattern and give the suppression a `--` reason**, which the roadmap item this closed offered as the equal alternative and which the measurement above would have supported. Two things rule it out. The reason would have had to argue from the 5000-character cap, which makes a regex in one file depend on a limit enforced in another — and the cap is not what makes the pattern safe, the absence of a forced failure is, which is a property one added mandatory clause destroys. And a reason comment is what stops the next reader looking; writing one here would have frozen a parser that was never doing a parser's job.

**Why not bound the input inside the helper instead**, the other shape of the same idea: it keeps the mismatch and adds a second length limit that has to be kept in step with `CONTACT_FIELD_LIMITS`.

**Detection widens slightly at the edges.** `HTTPS://` is now caught, and a scheme followed by a host the old pattern rejected — `https://localhost` with no trailing slash — is too. Both are more spam caught, which is the direction this heuristic should err in. A bare `example.com` with no scheme is still not detected; the old pattern required a scheme as well, so that is unchanged.

**`formatValue`'s `security/detect-object-injection` suppression went with it**, replaced by `args.at(Number(number))`. Same behaviour, no computed member access, nothing to suppress.
