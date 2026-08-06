# Roadmap

Planned work, not in any particular order or priority. Each item below is a candidate for its own scoped session — see the linked doc for context on the current implementation before starting.

## Testing

- [x] **Set up Jest + React Testing Library.** Done 2026-08-06 — see [development.md](development.md#testing) for the harness (`jest.config.js` via `next/jest`, `.env.test`, the `@utils/test/render` custom-render helper, ESLint's jest-env override) and two passing smoke tests (`state/reducer.test.ts`, `components/content/Header.test.tsx`).
- [ ] **Add unit test coverage.** The harness above is ready; this is the actual tiered coverage work. Scoped plan (tiers, effort estimate) was worked out on 2026-08-06; roughly 26–38 hours remaining for everything except deep Google Maps SDK mocking, +8–14 hours for that. Known gap to solve per-test as this proceeds: `getConfig()`/`useRouter()`/`google.maps`/`fetch` aren't mocked yet — see [development.md](development.md#testing). Sequencing note: the Maps-layer tests should encode _intended_ behavior, not just pin down the current output — see "Audit & fix Google Maps layer regressions" below, which should inform those tests rather than follow them.
- [ ] **Add a CI workflow.** No `.github/workflows` (or any CI) exists yet. A basic lint + type-check + test GitHub Action on push/PR would make the test-coverage item above actually enforced rather than just available locally.

## Framework & dependency upgrades

- [ ] **Upgrade Next.js** (currently `^14.2.35`, Pages Router). Known required change while doing this: drop `swcMinify: true` from `next.config.js` — it's been a no-op default since Next 13 and the config option is removed in Next 15, so it'll need to go either way.
- [ ] **Upgrade React** (currently `^18.3.1`).
- [ ] **Upgrade Mantine** (currently v6 — `@mantine/core`, `form`, `hooks`, `notifications`, `next`, all `^6.0.22`). See [styling-theming.md](styling-theming.md) for the current theme/color-override setup that any migration needs to carry forward, including the `mantine-custom-colors.d.ts` module augmentation.
- [ ] **Migrate `next/legacy/image` → `next/image`.** Used in 5 files: `pages/index.tsx`, `pages/portfolio.tsx`, `components/shared/Logo.tsx`, `components/content/FixedBackground.tsx`, `components/shared/WaveWrapper.tsx`. Leftover from a past Next upgrade; do this alongside (or immediately after) the Next.js upgrade rather than as a separate pass, since the two are entangled (`layout`/`objectFit` props vs. `fill`/`style`).
- [ ] **Re-evaluate `next-pwa`.** It's been effectively unmaintained for a while and has known friction with newer Next.js versions. Currently gated behind `WITH_PWA` (unset in the committed env files, so it's off by default — see [environment-variables.md](environment-variables.md#build-only)). Options once the Next.js upgrade lands: confirm it still works, swap to its maintained fork (Serwist), or drop PWA support entirely if it's not actually in use.

## Bug fixes

- [ ] **Audit & fix the Google Maps layer regressions.** The `travel/` components (`Map`, `Marker`, `Polyline`, `MapWrapper`) were ported from a vanilla-JS implementation to React a couple of years ago, and some functionality was lost in translation. See [travel-feature.md](travel-feature.md) for how the imperative Maps SDK objects are currently wired into the React tree. Needs a specifics pass (either from memory of what broke, or a fresh audit against typical vanilla-JS Maps behavior) before writing regression tests for this layer.
