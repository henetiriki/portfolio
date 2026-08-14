# Engineering Decisions

This log records durable choices whose rationale is useful beyond the change that introduced them. It is intentionally selective: current implementation details belong in the topical documentation, completed work belongs in [Project History](project-history.md), and unfinished work belongs in the [Roadmap](roadmap.md).

## D001 — Separate plans, decisions and history

- **Status:** Accepted
- **Decided:** 2026-08-09

The roadmap had become a combined backlog, changelog and migration diary. That preserved context but obscured the work that remained.

The [Roadmap](roadmap.md) now contains open work only. This file records durable rationale, while [Project History](project-history.md) is the concise release record. Detailed operational knowledge stays beside the feature it affects. When work is completed, remove it from the roadmap, update the relevant topical document, and add a short history entry; create or amend a decision only when the rationale is expected to influence future changes.

## D002 — Track Active LTS Node.js releases

- **Status:** Accepted
- **Decided:** 2026-08-06

The deployed runtime, local version file and Node type declarations must describe the same platform. Adopting a Current release early would add platform churn without meaningful benefit for this site.

Move Node only after the target release reaches Active LTS and the deployment host supports it. Update `engines.node`, `.nvmrc` and `@types/node` together, then validate installation, native dependencies, tests and a production build on that runtime. CI reads `.nvmrc`, so it follows the version change automatically. Node 26 is therefore scheduled for review on or after 2026-10-28 rather than being adopted while Current.

## D003 — Use Mantine's static styling architecture

- **Status:** Accepted
- **Decided:** 2026-08-08

Mantine v7 removed the old Emotion-oriented integration and made CSS Modules, CSS variables and its PostCSS preset the natural path. Restoring a compatibility CSS-in-JS layer would preserve obsolete patterns and make the styling system harder to inspect.

Component styles use CSS Modules and Mantine style props; `postcss-preset-mantine` and `postcss-simple-vars` provide documented mixins and build-time breakpoints. Small finite variants use modifier classes rather than runtime-only custom properties. The project also retains Next's default PostCSS capabilities explicitly because defining a custom PostCSS config disables Next's built-in pipeline. See [Styling & Theming](styling-theming.md) for the implementation and migration-specific traps.

## D004 — Generate the service worker in every production build, never in development

- **Status:** Accepted; supersedes the `WITH_PWA` opt-in
- **Decided:** 2026-08-07; reaffirmed 2026-08-09; revised 2026-08-14

Offline support is a production feature. It was originally gated behind `WITH_PWA=true` so local and preview builds did not pay for service-worker generation. In practice `.env.production` always set it, so the flag only ever selected between what ships and a configuration nothing deployed — while costing a second CI build, a second build step in the release checklist, and a branch in `next.config.js`.

The gate is now `NODE_ENV`: every production build generates `public/sw.js`, and development never does. There is no flag to set anywhere.

**This is deliberately not Serwist's own `disable` option.** `withSerwistInit` attaches a `webpack` key to the config unconditionally — `disable` is only consulted inside that callback. Since `next dev` runs Turbopack, which `@serwist/next` does not support and warns about, wrapping unconditionally would put a webpack config in front of development. Returning early before the dynamic `import()` keeps Serwist out of dev entirely.

Production builds still use `next build --webpack` explicitly, because Next 16 hard-fails a Turbopack build when a webpack config is present. Development remains on Turbopack for speed. Revisit the webpack opt-out when a stable Serwist release supports the production bundler without custom compatibility work — `@serwist/next@10`, currently preview-only, may be that release. See [PWA & SEO](pwa-seo.md) and [Development Workflow](development.md#bundlers-turbopack-in-dev-webpack-in-builds).

## D005 — Generate CSS declarations for WebStorm without shipping them

- **Status:** Accepted
- **Decided:** 2026-08-08

Mantine creates custom theme colour properties at runtime. WebStorm analyses CSS Modules statically, so it cannot discover those declarations and reports valid custom properties as unresolved.

`yarn css-vars:generate` derives `src/styles/mantine-custom-properties.css` from the theme colour source, and `postinstall` keeps it current. The file exists only for IDE analysis: it is gitignored and never imported by the application. Runtime values continue to come from `MantineProvider`. CI runs `css-vars:check` to validate generation rather than pretending the ignored output is committed source. See [Styling & Theming](styling-theming.md#webstorm-css-variable-resolution-mantine-custom-propertiescss).

## D006 — Treat the contact endpoint as a stable public boundary

- **Status:** Accepted
- **Decided:** 2026-08-09

Contact submissions contain personal data and trigger external email side effects. Transport details, raw provider errors and internal anti-automation behaviour must not leak through logs, responses or documentation.

The endpoint validates the method and request shape at runtime, enforces bounded fields, safely renders message content and returns a stable generic public error schema. Owner delivery is required; courtesy-confirmation failure is non-fatal so a client retry cannot duplicate an already delivered owner email. Bot verification and the secondary signal remain defense in depth, with sensitive mechanics deliberately undocumented. See [Contact Feature](contact-feature.md).

## D007 — Modernise Google Maps in coordinated phases

- **Status:** Accepted
- **Decided:** 2026-08-09

`@googlemaps/react-wrapper` is archived and classic `google.maps.Marker` is deprecated, but Advanced Markers are not a constructor-level substitution. They change map setup, icon rendering, animation, cleanup and zoom behaviour.

Deliver the coordinated migration as small parity-preserving releases: maintained loader first; Map ID and cloud style second; Advanced Markers and their changed rendering/animation lifecycle third; final cleanup last. This gave each infrastructure boundary a focused test and manual-QA surface without prematurely rewriting the imperative marker layer. Loading/error states, geometry decoding, marker and polyline sequencing, information windows, zoom-responsive visuals and reduced-motion behaviour were preserved throughout. The completed phases and current implementation live in [Travel / Google Maps Feature](travel-feature.md#modernisation-phases).

The Map ID phase deliberately retained raster rendering to isolate cloud-style parity from renderer differences. Advanced Markers supported raster for the feature set used here, so the renderer was evaluated separately after marker parity rather than silently folded into either migration phase. Once all four phases passed manual QA, the Map ID was switched to vector and the reveal was independently updated to use its fractional zoom and camera controls.

## D008 — Keep the package manager's supply-chain defaults

- **Status:** Accepted
- **Decided:** 2026-08-11

Yarn 4.18 introduced three install-time protections. A routine version bump disabled all of them in the same commit, without a decision or history entry, so the project's security posture changed as an invisible side effect of a maintenance upgrade.

Package-manager hardening defaults are kept unless a specific, recorded need justifies an exception, and any exception is scoped to the narrowest unit that requires it:

- `npmMinimalAgeGate` keeps its `1d` default. The gate blocks versions published within the last day, which is the window a compromised release depends on. If it ever conflicts with automated updates, Dependabot's own `cooldown` is the correct lever — do not disable the gate repository-wide.
- `approvedGitRepositories` keeps its empty default. The lockfile contains no git-protocol resolutions, so a permissive pattern grants a capability nothing uses.
- `enableScripts` keeps its `false` default. Exactly one installed package declares an install script (`unrs-resolver`, reached through `eslint-import-resolver-typescript`), so it is allowed individually through `dependenciesMeta`. Notably `sharp` needs no exception: 0.35 ships prebuilt platform packages.

Verify changes here with a deleted `node_modules` and a full reinstall rather than an incremental one, because an already-built dependency will mask a missing permission.

## D009 — Accept the contact endpoint's automation-only protection

- **Status:** Accepted
- **Decided:** 2026-08-11

[D006](#d006--treat-the-contact-endpoint-as-a-stable-public-boundary) treats the contact endpoint as a stable public boundary, which makes the absence of request-rate limiting worth stating rather than leaving as an unexamined gap.

Protection is deliberately automation-focused: bot verification plus a secondary signal, bounded field limits and a stable generic error schema. There is no per-client rate limit, so a determined human can still submit repeatedly. This is accepted for a personal site with a single recipient, where the cost of abuse is nuisance email rather than data exposure or spend, and where a rate limiter would need shared state that the current stateless deployment does not have.

Revisit if submissions are ever abused in practice, if the endpoint gains a costlier side effect than one email, or if the deployment acquires a natural coordination point. Prefer the platform's own edge rate limiting over application state if so.
