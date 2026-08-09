# Styling & Theming

## Stack

- **Mantine v9** is the component library. Styling is **CSS Modules + CSS variables**, not CSS-in-JS — v7 dropped Emotion entirely in favor of static stylesheets and v8/v9 keep that model, with `postcss-preset-mantine` (`postcss.config.cjs`) providing Mantine's build-time CSS syntax and `MantineProvider` exposing theme values as `--mantine-*` custom properties. Everything in this document was verified against v9; the v6 → v7 history is retained where it explains why a workaround exists.
- No `@mantine/next` (removed in v7 — there's no SSR style-injection step to wire up anymore, since styles ship as static `.css` files) and no `@emotion/*` packages.
- Component-scoped styles live in a `Component.module.css` file next to the component, imported as `classes` and applied via `className={classes.foo}`. Simple root styles use Mantine's first-class style props where one exists (`c`, `h`, `display`, etc.); unsupported values can stay in `style` when they are isolated or runtime-dependent, while cohesive static rules live in the component's CSS Module. See "Patterns worth knowing" below for when to use which.

## Theme (`src/styles/theme.ts`)

```ts
export const theme = createTheme({
  colors: colorOverrides, // see below
  components: {
    Loader: Loader.extend({ defaultProps: { type: 'dots' } }),
  },
  defaultRadius: 'sm', // see below — v9 changed the default to 'md'
  fontFamily: 'var(--portfolio-font-body), ...', // Roboto body text
  fontSizes: { xs, sm, md, lg, xl },
  headings: {
    fontFamily: 'var(--portfolio-font-heading), ...', // Montserrat
    sizes: { h1..h6 },
  },
  primaryColor: 'whisper',
  primaryShade: 4,
});
```

Applied once in `_app.tsx` via `<MantineProvider forceColorScheme='dark' theme={theme}>`, alongside `import '@mantine/core/styles.css'` and `import '@mantine/notifications/styles.css'`. `_document.tsx` spreads `mantineHtmlProps` onto `<Html>` and renders `<ColorSchemeScript forceColorScheme='dark' />` before hydration. The site is dark-mode only, with no light theme or toggle, so `forceColorScheme` (not `defaultColorScheme`) is set on both: the script makes the initial server-rendered document dark before React hydrates, and the provider keeps the runtime scheme fixed rather than merely seeding an initial, switchable value.

v6's `colorScheme` and `globalStyles` theme keys don't exist in v7. `colorScheme` moved to `MantineProvider`'s `forceColorScheme`/`defaultColorScheme` props (above); the old `globalStyles` callback (letter-spacing on headings, base `html` font-size, `body` defaults) moved to a plain stylesheet, `src/styles/global.css`, imported once in `_app.tsx`. That file also has to explicitly set `body { background-color: transparent }` — v7's base stylesheet sets an opaque `background-color: var(--mantine-color-body)` on `body` by default (v6's normalize step didn't), which would otherwise paint in front of `FixedBackground`'s `position: fixed; z-index: -1` image layer and hide it.

**`defaultRadius: 'sm'` is set deliberately, not incidentally.** Mantine v9 changed its own default from `sm` (4px) to `md` (8px) — confirmed by diffing the shipped `default-theme.mjs` between 8.3.18 and 9.5.1. Every component that doesn't pass an explicit `radius` inherits it, so leaving it unset would have silently rounded the `Tooltip`, notification toasts and `Drawer` more than before. Pinning `sm` preserves the pre-v9 appearance. The buttons and inputs that pass `radius='lg'` (`ContactForm`, `portfolio.tsx`, `ErrorContent`) were never affected either way. **This is a design choice, not a technical constraint** — deleting the line adopts Mantine's newer, rounder default.

`src/styles/fonts.ts` loads **Montserrat** (400/600/700) and **Roboto** (400/700) through `next/font/google`. Next downloads and self-hosts the files at build time instead of making the browser request render-blocking Google stylesheets. `_app.tsx` writes the generated family names to `--portfolio-font-heading` and `--portfolio-font-body` in the shared `<Head>`; the Mantine theme consumes those properties and retains the existing system-font fallbacks.

### How theme values become CSS variables

`theme.colors` (and `fontSizes`, `spacing`, `radius`, etc.) don't need any manual `:root` block — `MantineProvider` itself generates one. Its `cssVariablesSelector` prop defaults to `:root`, and at render time (server-rendered, so it's in the initial HTML with no flash) it injects a `<style data-mantine-styles>` tag containing `:root { --mantine-color-shamrock-4: ...; ... }` for every value in the theme. `colors.ts` stays a plain `Record<string, MantineColorsTuple>` handed to `createTheme()` — that's the correct, and only necessary, source of truth.

`MantineProvider`'s `cssVariablesResolver` prop exists for two narrower cases this app doesn't currently need: exposing a `theme.other` value as a CSS variable, or a value that needs to differ between light and dark color schemes. Since the site is dark-only and every color is already a full `MantineColorsTuple` on `theme.colors`, nothing here needs it — but it's the right tool if a scheme-dependent or `theme.other`-sourced CSS variable comes up later.

## Color palette (`src/styles/colors.ts`)

`colorOverrides` defines 17 custom Mantine color scales (each a 10-shade `MantineColorsTuple`, index `[0]` lightest → `[9]` darkest — v7 renamed the `Tuple<string, 10>` type), registered as `ExtendedCustomColor` via `mantine-custom-colors.d.ts` module augmentation so they're usable anywhere a Mantine color name is accepted (`c='shamrock'`, `bg='valhalla'`, `color='torch-red'`, or a raw `var(--mantine-color-shamrock-4)` in a CSS Module):

| Color                                                            | Rough hue       | Typical use                                                                                           |
| ---------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `whisper`                                                        | near-white/grey | primary color, default text/borders                                                                   |
| `silver`, `matterhorn`                                           | greys           | secondary text                                                                                        |
| `gunmetal`, `cinder`, `paynes-grey`, `valhalla`, `black-russian` | dark blue-greys | backgrounds (`black-russian` = header/footer/nav backgrounds, `valhalla` = `Content` card background) |
| `pumpkin`                                                        | orange          | past-location map markers                                                                             |
| `corn`                                                           | yellow          | flight polylines                                                                                      |
| `pine-green`, `medium-sea-green`                                 | greens          | airport markers / map landscape styling                                                               |
| `shamrock`                                                       | bright green    | the site's accent color — links, buttons, active states                                               |
| `viking`, `all-ports`                                            | teals/blues     | cruise polylines / port markers, map water styling                                                    |
| `alizarin`, `torch-red`                                          | reds            | station markers / current-location marker & rail polylines / error notifications                      |

`ExtendedCustomColorOverrides = Record<ExtendedCustomColor, MantineColorsTuple>` is the type backing this — see `mantine-custom-colors.d.ts` for the module augmentation that merges it into Mantine's own `MantineThemeColorsOverride`. At runtime, `MantineProvider` turns every shade into a `--mantine-color-<name>-<index>` CSS variable (e.g. `--mantine-color-shamrock-4`) — that's how CSS Modules reference the palette without any JS import.

## PostCSS setup (`postcss.config.cjs`)

This file has to do two independent jobs, because **Next.js completely disables its own default PostCSS pipeline (Autoprefixer, flexbox bug fixes, stage-3 feature compilation) the moment a project defines its own `postcss.config.cjs`** — see [Next's docs](https://nextjs.org/docs/pages/guides/post-css#customizing-plugins). So this config isn't just "add Mantine's plugin" — it has to explicitly re-list Next's own defaults too, or the whole app silently loses vendor prefixing:

```js
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        /* ...sm/md/lg/xl */
      },
    },
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: { flexbox: 'no-2009' },
      stage: 3,
      features: { 'custom-properties': false },
    },
  },
};
```

- `postcss-preset-mantine` — provides `@mixin` support (`smaller-than`/`larger-than`/`hover`/`light`/`dark`/...), CSS nesting, and the `alpha()`/`lighten()`/`darken()` color functions (`color-mix()`-based — the v7 replacement for v6's `theme.fn.rgba()` etc.). Theme-derived `--mantine-*` variables are generated separately by `MantineProvider`.
- `postcss-simple-vars` — provides Sass-like `$mantine-breakpoint-*` values as arguments to Mantine's `smaller-than`/`larger-than` mixins in CSS Modules. This exists because **CSS custom properties can't be referenced inside a media query's condition** — `@media (min-width: var(--x))` is syntactically accepted but never matches in any browser, since `var()` resolution doesn't apply inside media features. (Mantine's own base stylesheet does declare `--mantine-breakpoint-sm` etc. as real custom properties, but that's unrelated — they're not usable in `@media` either.) `postcss-simple-vars` must be listed after `postcss-preset-mantine` so arguments such as `@mixin smaller-than $mantine-breakpoint-sm` resolve at build time. The mixin then converts the value to `em` and, for `smaller-than`, subtracts `0.1px` to prevent overlap with the corresponding `larger-than` boundary.
- `postcss-flexbugs-fixes` + `postcss-preset-env` — verbatim from Next's own default `postcss.config.json`, restoring what got disabled. `features: { 'custom-properties': false }` is also copied from Next's default, for the same reason Next disables it: statically downleveling `var()` for older browsers isn't safe to do automatically, and would corrupt Mantine's runtime-generated `--mantine-*` variables.

Plugin order matters here beyond alphabetical: `postcss-preset-mantine` needs to resolve its `@mixin`/nesting syntax into plain CSS _before_ Autoprefixer and stage-3 feature compilation see it.

## Patterns worth knowing

- **Static root styles with a matching Mantine style prop**: prefer the prop, e.g. `c='silver.4'`, `h='75vh'`, `display='none'`, or `pos='fixed'`. Besides being shorter, color-aware props resolve theme names without spelling out a CSS variable. For unsupported properties, keep a genuinely isolated or runtime-derived value in `style` (for example a dynamic `visibility` or one-sided border), but put a cohesive static rule in the component's CSS Module (for example `overflow` + `z-index` on `FixedBackground`). Do not contort a supported shorthand into a subtly different declaration merely to eliminate `style`.
- **Anything needing a pseudo-class/element (`:hover`, `::before`), a nested/descendant selector, or a responsive breakpoint mixin**: use a `Component.module.css` file + `className={classes.foo}`. Most of this app's components fall in this bucket (hover states, responsive nav/burger visibility, `::before`/`::after` decorative elements).
- **Use Mantine's `rem()` helper for scale-aware lengths.** In a `.css` file, WebStorm currently interprets the preset's one-argument `rem(14px)` PostCSS helper as the native CSS remainder function, which requires two arguments, and reports a false-positive "Mismatched parameters" warning ([JetBrains WEB-75952](https://youtrack.jetbrains.com/projects/WEB/issues/WEB-75952/WebStorm-treats-custom-Sass-function-rem-as-native-CSS-rem-and-reports-Mismatched-property-value)). Keep the documented Mantine syntax and place `/*noinspection CssInvalidFunction*/` immediately before each affected declaration; these localized suppressions preserve every other CSS inspection and can be found and removed once JetBrains fixes the collision. Calls such as `rem(14)` in `.ts`/`.tsx` files need no suppression because WebStorm parses them as JavaScript rather than CSS.
- **A prop with a small, fixed set of values** (e.g. `NavigationLink`'s `variant: 'sm' | 'md'`): use a CSS Modifier class (`.link.sm { ... }`), not a JS-computed CSS custom property set via `style`. Every possible value lives in the CSS file as ordinary, statically-resolvable CSS this way — nothing is ever defined only-at-runtime. Reach for a runtime custom property only when the value genuinely can't be enumerated at build time (computed from data, arbitrary numbers); even then, declare a real default directly on the rule that uses it (`.thing { --offset: 0px; ... }`), not just as a `var(--x, fallback)` at the use-site — a fallback inside `var()` is a _runtime_ default and isn't visible to static CSS tooling (IDE inspections, some linters) the way an actual declaration is.
- Components needing theme values in JS logic (not styles) use `useMantineTheme()` (e.g. `Legend`, `ContactForm`).
- Wave dividers (`WaveWrapper`) are pre-rendered SVG files under `public/images/waves/`, not generated CSS — swapping the visual "torn paper" section transition would mean editing those SVGs rather than the component. `WaveWrapper` accepts Mantine's full `MantineStyleProp` contract and merges it after its defaults with `style={[defaults, style]}`, so the couple of call sites that override its height/margin retain caller precedence. See "`WaveWrapper`'s height override" below for a real bug this shape of API ran into.
- `Group`'s `position`/`spacing` props were renamed to `justify`/`gap` in v7 (CSS Flexbox-aligned naming). `Button`/`TextInput`/`Textarea`'s `leftIcon` prop was renamed to `leftSection`. Mantine's own `Header` layout component was removed in v7 (superseded by `AppShell.Header`, not used here) — `Navigation` renders a plain `Box component='header'` instead.
- Decorative CSS transitions are disabled inside `@media (prefers-reduced-motion: reduce)`, while behavior controlled from React uses Mantine's `useReducedMotion()` hook. Current examples are the navigation underline, home-page role animation, smooth scroll and Maps entrance/reveal animations.
- A raw pixel breakpoint passed to v6's `theme.fn.largerThan`/`smallerThan` (e.g. `fn.largerThan(1080)`, used for a non-token breakpoint in `portfolio.tsx`) gets converted through `em()` at a 16px base, exactly like a named token. Its v7 equivalent is `@mixin larger-than 1080px`, which the Mantine PostCSS preset compiles to `@media (min-width: 67.5em)` rather than leaving it as a literal pixel query. This preserves the breakpoint's response to the user's browser default font size.
- **Never let an autoformatter/refactor tool rewrite `$mantine-breakpoint-*` to `var(--mantine-breakpoint-*)` in a responsive mixin argument.** They look interchangeable but aren't: `$mantine-breakpoint-*` (`Navigation.module.css`, `NavigationLink.module.css`, `portfolio.module.css`) is a `postcss-simple-vars` **build-time substitution** that the Mantine mixin turns into a literal `em` media boundary before the browser sees it. `var(--mantine-breakpoint-*)` is a runtime CSS custom property, and the resulting `@media (min-width: var(--x))` never matches because `var()` resolution does not apply inside media features. This happened twice during the v7 migration and was caught only through real-browser `matchMedia()` checks, not linting, type-checking, or tests.

## Post-v7 visual-parity fixes

These surfaced one-by-one during manual page-by-page browser QA after the v7 migration shipped — each is a real v6→v7 behavioral difference, confirmed by comparing computed styles against the live production site, not a guess. Listed here (rather than as CSS comments) per this app's convention of keeping `.css`/`.module.css` files comment-free and putting the "why" in docs instead.

### `global.css`'s four rules

```css
body {
  background-color: transparent;
  /* ... */
}

img {
  vertical-align: middle;
}

p.mantine-Text-root {
  margin: 1em 0;
}

html:root[data-mantine-color-scheme='dark'] {
  --mantine-color-error: var(--mantine-color-torch-red-2);
}
```

- **`body { background-color: transparent }`** — v7's base stylesheet sets an opaque `background-color: var(--mantine-color-body)` on `body` by default (v6's normalize step didn't). `FixedBackground` relies on a `position: fixed; z-index: -1` image to show through everything above it — an opaque `body` background paints in front of that negative-z-index layer and hides it.
- **`img { vertical-align: middle }`** — standard normalize.css rule that v6's `withNormalizeCSS` included and v7 has no equivalent for. Without it, an inline `<img>` inside a block container (e.g. the logo's `Link` wrapper) reserves extra line-box space below itself for the font's descender, since the browser default is `vertical-align: baseline` — the logo rendered ~7.5px taller than it should and sat misaligned from the rest of the nav.
- **`p.mantine-Text-root { margin: 1em 0 }`** — v7's base stylesheet sets `margin: 0` unconditionally on every `Text` (and `Anchor`, which shares the same base class); v6 never overrode the browser's native `<p>` margin (1em top/bottom, scaled to the paragraph's own font-size). This rule restores that default, scoped to actual `<p>` elements only (not `Text` used as a `span`, and not `Anchor`, which also carries the `mantine-Text-root` class but shouldn't gain margin). **This is deliberately broad** — it targets every `Text` that renders as `<p>`, which includes both genuine prose (the About Me paragraphs, job-description bullets in `fixtures/experience.tsx`, which _should_ get this margin) and label-style `Text` usages that happen to default to `<p>` but were never meant to have paragraph spacing (`TimelineInstitution`, `TimelineLocation` — both explicitly set `mb={0}`, a clear signal of zero-margin intent). Those label components additionally set `mt={0}` themselves to opt back out of this rule, rather than narrowing the global selector — narrowing it would need a stable way to distinguish "prose paragraph" from "label rendered as `<p>`" in CSS, which doesn't exist; the per-component override is the more maintainable of the two options if a similar case comes up.
- **`html:root[data-mantine-color-scheme='dark'] { --mantine-color-error: ... }`** — v7's default dark-scheme `--mantine-color-error` is `red-8` (`#e03131`); this app uses the lighter custom `torch-red-2` (`#fc7284`) for validation-error text, borders, and required-field asterisks. Overriding the variable is more resilient than chasing every component that consumes it, but the selector matters: Mantine's own rule is `:root[data-mantine-color-scheme="dark"]`, and **`:root` is a pseudo-class** (class-level specificity, `(0,1,0)`), not an element selector — so a plain `html[data-mantine-color-scheme='dark']` override (specificity `(0,1,1)`, one element + one attribute) actually still _loses_ to Mantine's `(0,2,0)` (one pseudo-class + one attribute). This cost a real debugging round-trip: the override compiled fine and the CSS variable existed, but silently never took effect. Matching `:root`'s specificity by including it alongside `html` (`html:root[...]`, `(0,2,1)`) wins regardless of stylesheet load order.

### Component-level fixes (not in `global.css`)

- **`WaveWrapper`'s height override.** `WaveWrapper` used to set a hardcoded `h='10rem'` Box style-prop _and_ merge a caller-supplied `style` value (for the one call site — the footer's top wave — that needs a shorter `5rem`). Mantine's `getBoxStyle` (`@mantine/core/core/Box/get-box-style`) always spreads style-props **after** the `style` value (behaviour unchanged in v8): `{ ...style, ...vars, ...styleProps }`. That means a shorthand prop like `h` unconditionally wins over anything the same component's own `style` prop sets for that CSS property — the footer's top wave rendered at 160px instead of the intended 80px, visibly taller than production and throwing off the logo's position relative to it. The default now lives in the first entry of Mantine's documented style array (`style={[{ height: '10rem', overflow: 'hidden' }, style]}`), so an object, callback, or array supplied by the caller is merged later and can override it. A focused component test locks down the `5rem` override.
- **Outline-variant buttons need an explicit shade.** `color='shamrock'` (no shade) on a `variant='outline'` `Button` resolved to the wrong, much-darker green in dark mode. Mantine's dark-scheme "outline" variant color derivation is `--mantine-color-<name>-outline: var(--mantine-color-<name>-<max(primaryShade-4, 0)>)` — with this theme's `primaryShade: 4`, that's shade `0` (near-white-tinted, effectively invisible against the button's own text). Fixed everywhere an outline/filled button uses a non-primary color by passing an explicit shade instead of relying on the derived default: `color='shamrock.4'` (`portfolio.tsx`'s action button, `ContactForm`'s Send button, `ErrorContent`'s button).
- **`Anchor`'s color prop is `c`, not `color`.** `color` only drives Button-style variant color resolution (see above) — it's not a general text-color prop on `Anchor`/`Text`. One Anchor (the Open Source Contributions link on the home page) was left on `color='shamrock'` after the mechanical `sx`→prop conversion, silently rendering with no color at all instead of shamrock green.
- **`Anchor`/`Text` no longer set their own font-size/weight/family — use the `inherit` prop, not a manual `font-size: inherit` CSS rule.** v6's `Text` had an `inherit` boolean prop specifically for "match the surrounding text/heading instead of applying my own default styles"; v7 renamed it to a `data-inherit` attribute (still exposed as the same `inherit` prop) that Mantine's own base stylesheet keys off: `:where([data-inherit]) { line-height: inherit; font-weight: inherit; font-size: inherit; }`. Two places initially patched only the font-size symptom with a hand-written `.titleLink { font-size: inherit }` CSS rule (`portfolio.module.css`, `TimelineInstitution.module.css`) — that fixed the size but left `font-weight: normal` (Mantine's `Text` base default) fighting the bold `<h3>`/`<Title>` ancestor, so linked card titles rendered in a lighter weight than unlinked ones and than production. Replaced both CSS hacks with the `inherit` prop on the `Anchor` itself, which fixes size, weight, and line-height together and needs no CSS Module rule at all.
- **A `Text`-without-`span` inside a `Title` still renders its own default size.** `portfolio.tsx`'s no-`url` card title branch was `{!url && <Text>{title}</Text>}` — a leftover from v6, where `Text` had (or could have had) `inherit` set; without it, `Text` renders at Mantine's own default `md` size (14px/400) regardless of the ancestor `<h3>`'s 24px/700. Since the surrounding `<Title order={3}>` already provides the correct heading styles, the fix was simply to drop the redundant `Text` wrapper entirely (`{!url && title}`) rather than add another `inherit` prop.
- **A dead v6 prop became live in v7.** `FooterContainer` passed `ff={theme.headings.fontFamily}` (Montserrat) to its `Box`. In v6 this was a no-op — `Text`/`Anchor` always set their own explicit `font-family`, which won regardless of what an ancestor specified. In v7, `Text`/`Anchor` don't set `font-family` themselves at all (confirmed by reading the shipped `Text.css` — no `font-family` property), so they correctly inherit from the nearest ancestor — which meant the entire footer (nav links, copyright, timestamp) started rendering in the heading font instead of body text. Fixed by deleting the prop; nothing was relying on it doing anything.
- **`Textarea`'s `minRows`/`maxRows` are no-ops without `autosize`.** `ContactForm`'s message field set `minRows={4}` but not `autosize` — Mantine's `Textarea` only forwards `minRows`/`maxRows` to the underlying `react-textarea-autosize` when `autosize` is also true (`node_modules/@mantine/core/.../Textarea.mjs`: `shouldAutosize = autosize && ...; autosizeProps = shouldAutosize ? { maxRows, minRows } : {}`). Without it, the field silently fell back to its CSS `min-height` (~50px, roughly 2 rows) instead of the intended 4-row starting height. Fixed by adding `autosize`.
- **Custom input borders must preserve Mantine's error state.** `ContactForm.module.css` sets the normal and focused input borders directly to match production. That direct `border-color` wins over Mantine's variable-driven error rule (`--input-bd: var(--mantine-color-error)`), so validation messages appeared but the borders remained white/grey. An `.input[data-error]` rule now restores `var(--mantine-color-error)` after the focus rule; Mantine supplies `data-error='true'` to both `TextInput` and `Textarea`, and the selector also keeps the error border while the invalid field is focused.

## WebStorm CSS variable resolution (`mantine-custom-properties.css`)

`src/styles/mantine-custom-properties.css` is generated by `yarn css-vars:generate` (`scripts/generate-mantine-css-variables.mjs`, also run on `postinstall`) from `colors.ts`. It's a plain `:root { --mantine-color-<name>-<shade>: <hex>; ... }` block for every custom color and shade — **intentionally never imported at runtime** (the real values come from `MantineProvider`'s generated `<style data-mantine-styles>` tag, per "How theme values become CSS variables" above). Its only purpose is letting WebStorm's static CSS analysis resolve `var(--mantine-color-shamrock-4)` references in `.module.css` files instead of flagging them as unknown custom properties. `yarn css-vars:check` (i.e. `css-vars:generate --check`) verifies that the generated file in the current workspace matches `colors.ts`; CI runs it after `postinstall` as a generated-output integrity check. The file is deliberately gitignored, so there is no committed copy for CI to compare and no repository-drift claim to make. Edit `colors.ts`, never this file directly — it's fully regenerated on every run, not merged.
