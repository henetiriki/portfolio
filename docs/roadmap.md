# Roadmap

Open work only. A completed item is simply removed — the merged pull request is the record that it happened, and current behaviour goes to the topical documentation. Items are grouped by area rather than strict priority; each should normally be delivered as its own scoped change unless a dependency is called out explicitly.

Last reviewed: 2026-09-07.

## Framework & dependency upgrades

- [ ] **Adopt the native TypeScript 7 toolchain when ecosystem support is ready — blocked.** The project now uses TypeScript 6, the supported JavaScript-based bridge release, with its configuration deprecations already removed. The 2026-08-09 TypeScript `7.0.2` trial still failed before compilation because Yarn's built-in compatibility patch expected `lib/_tsc.js`, which the native Go distribution does not ship; `typescript-eslint` also still declares a `typescript` peer range below `6.1.0` (checked through 8.69, 2026-09-03). Recheck only when Yarn supports the native distribution and TypeScript-ESLint supports its compiler API strategy; both conditions are required.

- [ ] **Upgrade Babel 7 to 8 when Jest supports it — blocked.** The app compiles with SWC and has no Babel configuration; Babel is a direct development dependency solely for Jest. `jest-config`, `@jest/transform` and `jest-snapshot` still depend on Babel 7, so follow Jest's support rather than forcing an app-irrelevant major ahead of its consumer.

- [ ] **Upgrade Node.js 24 to 26 on or after 2026-10-28.** The project follows Active LTS releases, and Node 26 does not reach that status until then. Confirm Vercel support first, then update `engines.node`, `.nvmrc` and `@types/node` together and validate installation, native dependencies, the full suite and both build modes on the new runtime.

- [ ] **Drop the `@serwist/next/browserslist` resolution once the upstream pin moves.** `package.json` carries a `resolutions` entry forcing `^4.28.7` because `@serwist/next` pins `browserslist` to the vulnerable `4.28.6` exactly, and its latest release still does. Check it at the next `@serwist/next` upgrade: if the published `dependencies` block names anything `4.28.7` or later, remove the entry, run `yarn install` and confirm `yarn npm audit --all --recursive` stays clean. An override left behind after upstream has moved is worse than none — it pins the graph to a range nobody is watching any more.

## CI & security hardening

- [ ] **Decide whether `update-visual-baselines.yml` accepts `dependabot/` branches, and document the decision beside its guard.** Its allowlist excludes that prefix although the [branch-name check](../AGENTS.md#branch-names) accepts it. Allowing it lets a write-enabled job push to a branch Dependabot may force-push; excluding it requires rebasing a visual bump onto `chore/` before updating baselines.

- [ ] **Upgrade ESLint off `9.39.5`.** `yarn npm audit --all` flags it as a deprecated, no-longer-supported version (moderate severity); it's a development-only dependency so there's no production exposure, but it's currently excluded from Dependabot's automated major-version updates (see `.github/dependabot.yml`'s `ignore` list) pending a coordinated config/plugin compatibility pass.

## Agent configuration

- [ ] **Verify push protection covers recognised provider keys and non-provider secret patterns.** Check live state through the approved private process before acting.

## Documentation gaps

- [ ] **Define when a repository setting may be named publicly — blocked on maintainer guidance.** The proposed boundary is whether its value is externally observable and has no security function; exact protections, exemptions and monitoring remain private. `squash_merge_commit_message` is the motivating case — it's named in two public files with no rule to point at. Confirm that no broader private rule applies, then align those mentions.

## Content & copy

- [ ] **Decide whether experience entries remain factual or become conversational.** Apply the choice across the whole history to avoid a visible seam. A middle path is factual past tense by default with one voice sentence only where an entry has a genuine story.
