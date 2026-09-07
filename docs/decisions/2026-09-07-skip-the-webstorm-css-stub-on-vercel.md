# Skip the WebStorm CSS stub on Vercel, and keep the check that proves it ran

## Context

- `postinstall` runs `yarn css-vars:generate`, which parses `src/styles/colors.ts` with the TypeScript compiler and writes `src/styles/mantine-custom-properties.css`. The file is gitignored and deliberately never imported: the real values reach the browser from `MantineProvider`, and the stub exists so WebStorm's static analysis can resolve `var(--mantine-color-…)` in `.module.css` files. See [Styling & Theming](../styling-theming.md#webstorm-css-variable-resolution-mantine-custom-propertiescss).
- A Vercel build has no IDE to serve it to. The step can cost time or fail the deploy; there is no outcome in which it helps.
- Two other things depend on `postinstall` producing it, which is what rules out moving generation elsewhere. CI runs `yarn css-vars:check` immediately after `yarn install --immutable`, and every worktree installs its own dependencies rather than sharing the parent's ([D-260814e](archive/2026-09-pre-migration.md#d-260814e--let-each-worktree-install-its-own-dependencies)) — the Content Security Policy worktree is the recorded case of `css-vars:check` failing because the file had not been generated.

## Decision

- `scripts/generate-mantine-css-variables.mjs` exits early when `VERCEL` is set. `postinstall`, `css-vars:generate` and `css-vars:check` are otherwise unchanged, so local installs, worktrees and CI behave exactly as before.
- The guard applies to generation only. `--check` runs whatever the environment.
- `css-vars:check` keeps its CI step.

## Status

Accepted, 2026-09-07.

## Consequences

**The deploy side has not been observed.** What was verified is the mechanism, locally: with `VERCEL` set the script writes nothing and `--check` still runs; without it the file is produced and `yarn css-vars:check` passes. Nothing can confirm the Vercel behaviour before a real deploy, so read the claims above as what the script does rather than as what a build was watched doing.

**A failure mode is accepted knowingly.** If the generated file were ever imported, CI would still pass — `VERCEL` is unset in GitHub Actions, so the stub is there — and only the Vercel build would break, on whatever unrelated change happened to deploy next. The protection against it is that the file is gitignored, which makes importing it visibly wrong rather than merely wrong.

**The condition is in the script rather than in `package.json`.** Making the script string a shell conditional would tie the install to a POSIX shell and would not survive a Windows one. The script already runs on every platform Node does.

**Not a development-only hook**, which is the alternative that reads as obviously right from the symptom: the generated file only matters to a developer, so generating it only for developers looks like the clean fix. It is not, because CI and every worktree are the two places that depend on an install producing it, and neither is a development machine.

**Not a blanket early return either**, which would leave `css-vars:check` unable to fail. That one has a call site and is argued there, beside the `!isCheckMode` it explains.

**`css-vars:check` earns its CI step, and this change is what makes the reason clear.** The roadmap item raising this doubted it, on the grounds that with no committed copy the check can only prove generation from `colors.ts` is deterministic. That undersells it: what it actually proves is that the install produced current output at all. That was already the invariant it caught in the worktree case above, and it is now the invariant this change makes conditional — a guard that stopped the write unconditionally would leave CI with no stub and a failing check. **It does not cover the whole class**: a guard still gated on `VERCEL` but widened past generate mode has no effect in GitHub Actions at all, so nothing there would notice. Cheap, gated behind the documentation-only path, and the only automated thing watching the mechanism above.
