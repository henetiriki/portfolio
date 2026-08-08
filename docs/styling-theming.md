# Styling & Theming

## Stack

- **Mantine v7** is the component library. Styling is **CSS Modules + CSS variables**, not CSS-in-JS — v7 dropped Emotion entirely in favor of a build-time `postcss-preset-mantine` pipeline (`postcss.config.cjs`) that turns theme values into `--mantine-*` custom properties.
- No `@mantine/next` (removed in v7 — there's no SSR style-injection step to wire up anymore, since styles ship as static `.css` files) and no `@emotion/*` packages.
- Component-scoped styles live in a `Component.module.css` file next to the component, imported as `classes` and applied via `className={classes.foo}`. Simple, non-selector, non-responsive one-off styles use the plain `style` prop instead of a CSS module — see "Patterns worth knowing" below for when to use which.

## Theme (`src/styles/theme.ts`)

```ts
export const theme = createTheme({
  colors: colorOverrides, // see below
  components: {
    Loader: Loader.extend({ defaultProps: { type: 'dots' } }),
  },
  fontFamily: 'Roboto, ...', // body text
  fontSizes: { xs, sm, md, lg, xl },
  headings: { fontFamily: 'Montserrat, ...', sizes: { h1..h6 } },
  primaryColor: 'whisper',
  primaryShade: 4,
});
```

Applied once in `_app.tsx` via `<MantineProvider defaultColorScheme='dark' theme={theme}>`, alongside `import '@mantine/core/styles.css'` and `import '@mantine/notifications/styles.css'`. `_document.tsx` renders `<ColorSchemeScript defaultColorScheme='dark' />` (mandatory in v7, even for a single-scheme site like this one — it's what prevents a flash of the wrong theme before hydration) and spreads `mantineHtmlProps` onto `<Html>`. The site is dark-mode only — there's no light theme or theme toggle.

v6's `colorScheme` and `globalStyles` theme keys don't exist in v7. `colorScheme` moved to `MantineProvider`'s `defaultColorScheme` prop (above); the old `globalStyles` callback (letter-spacing on headings, base `html` font-size, `body` defaults) moved to a plain stylesheet, `src/styles/global.css`, imported once in `_app.tsx`. That file also has to explicitly set `body { background-color: transparent }` — v7's base stylesheet sets an opaque `background-color: var(--mantine-color-body)` on `body` by default (v6's normalize step didn't), which would otherwise paint in front of `FixedBackground`'s `position: fixed; z-index: -1` image layer and hide it.

Two Google Fonts are loaded as `<link>` tags in `_document.tsx` (not `next/font`): **Montserrat** (400/600/700) for headings, **Roboto** (400/700) for body text.

### How theme values become CSS variables

`theme.colors` (and `fontSizes`, `spacing`, `radius`, etc.) don't need any manual `:root` block — `MantineProvider` itself generates one. Its `cssVariablesSelector` prop defaults to `:root`, and at render time (server-rendered, so it's in the initial HTML with no flash) it injects a `<style data-mantine-styles>` tag containing `:root { --mantine-color-shamrock-4: ...; ... }` for every value in the theme. `colors.ts` stays a plain `Record<string, MantineColorsTuple>` handed to `createTheme()` — that's the correct, and only necessary, source of truth.

`MantineProvider`'s `cssVariablesResolver` prop exists for two narrower cases this app doesn't currently need: exposing a `theme.other` value as a CSS variable, or a value that needs to differ between light and dark color schemes. Since the site is dark-only and every color is already a full `MantineColorsTuple` on `theme.colors`, nothing here needs it — but it's the right tool if a scheme-dependent or `theme.other`-sourced CSS variable comes up later.

## Color palette (`src/styles/colors.ts`)

`colorOverrides` defines 17 custom Mantine color scales (each a 10-shade `MantineColorsTuple`, index `[0]` lightest → `[9]` darkest — v7 renamed the `Tuple<string, 10>` type), registered as `ExtendedCustomColor` via `mantine-custom-colors.d.ts` module augmentation so they're usable anywhere a Mantine color name is accepted (`c='shamrock'`, `bg='valhalla'`, `color='torchRed'`, or a raw `var(--mantine-color-shamrock-4)` in a CSS Module):

| Color                                                          | Rough hue       | Typical use                                                                                          |
| -------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `whisper`                                                      | near-white/grey | primary color, default text/borders                                                                  |
| `silver`, `matterhorn`                                         | greys           | secondary text                                                                                       |
| `gunmetal`, `cinder`, `paynesGrey`, `valhalla`, `blackRussian` | dark blue-greys | backgrounds (`blackRussian` = header/footer/nav backgrounds, `valhalla` = `Content` card background) |
| `pumpkin`                                                      | orange          | past-location map markers                                                                            |
| `corn`                                                         | yellow          | flight polylines                                                                                     |
| `pineGreen`, `mediumSeaGreen`                                  | greens          | airport markers / map landscape styling                                                              |
| `shamrock`                                                     | bright green    | the site's accent color — links, buttons, active states                                              |
| `viking`, `allports`                                           | teals/blues     | cruise polylines / port markers, map water styling                                                   |
| `alizarin`, `torchRed`                                         | reds            | station markers / current-location marker & rail polylines / error notifications                     |

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

- `postcss-preset-mantine` — generates the `--mantine-*` CSS variables, `@mixin` support (`smaller-than`/`larger-than`/`hover`/`light`/`dark`/...), CSS nesting, and the `alpha()`/`lighten()`/`darken()` color functions (`color-mix()`-based — the v7 replacement for v6's `theme.fn.rgba()` etc.).
- `postcss-simple-vars` — provides Sass-like `$mantine-breakpoint-*` variables for use inside `@media` queries in CSS Modules. This exists because **CSS custom properties can't be referenced inside a media query's condition** — `@media (min-width: var(--x))` is syntactically accepted but never matches in any browser, since `var()` resolution doesn't apply inside media features. (Mantine's own base stylesheet does declare `--mantine-breakpoint-sm` etc. as real custom properties, but that's unrelated — they're not usable in `@media` either, which is exactly why this separate build-time-substituted `$var` mechanism exists.) `postcss-simple-vars` must be listed after `postcss-preset-mantine` so `@mixin smaller-than $mantine-breakpoint-sm`-style mixin arguments would resolve if used — though this codebase always uses the plain `@media (max-width: $mantine-breakpoint-sm)` form instead, matching Mantine's own documented pattern for this case.
- `postcss-flexbugs-fixes` + `postcss-preset-env` — verbatim from Next's own default `postcss.config.json`, restoring what got disabled. `features: { 'custom-properties': false }` is also copied from Next's default, for the same reason Next disables it: statically downleveling `var()` for older browsers isn't safe to do automatically, and would corrupt Mantine's runtime-generated `--mantine-*` variables.

Plugin order matters here beyond alphabetical: `postcss-preset-mantine` needs to resolve its `@mixin`/nesting syntax into plain CSS _before_ Autoprefixer and stage-3 feature compilation see it.

## Patterns worth knowing

- **Static styles with no selectors/responsiveness** (a single fixed color, one breakpoint-independent value): use the `style` prop directly, e.g. `style={{ borderRadius: '100%' }}` or `style={{ color: 'var(--mantine-color-silver-4)' }}`.
- **Anything needing a pseudo-class/element (`:hover`, `::before`), a nested/descendant selector, or a real `@media` breakpoint query**: use a `Component.module.css` file + `className={classes.foo}`. Most of this app's components fall in this bucket (hover states, responsive nav/burger visibility, `::before`/`::after` decorative elements).
- **A prop with a small, fixed set of values** (e.g. `NavigationLink`'s `variant: 'sm' | 'md'`): use a CSS Modifier class (`.link.sm { ... }`), not a JS-computed CSS custom property set via `style`. Every possible value lives in the CSS file as ordinary, statically-resolvable CSS this way — nothing is ever defined only-at-runtime. Reach for a runtime custom property only when the value genuinely can't be enumerated at build time (computed from data, arbitrary numbers); even then, declare a real default directly on the rule that uses it (`.thing { --offset: 0px; ... }`), not just as a `var(--x, fallback)` at the use-site — a fallback inside `var()` is a _runtime_ default and isn't visible to static CSS tooling (IDE inspections, some linters) the way an actual declaration is.
- Components needing theme values in JS logic (not styles) use `useMantineTheme()` (e.g. `Legend`, `ContactForm`).
- Wave dividers (`WaveWrapper`) are pre-rendered SVG files under `public/images/waves/`, not generated CSS — swapping the visual "torn paper" section transition would mean editing those SVGs rather than the component. `WaveWrapper` takes a plain `style` prop (not `sx` — that prop doesn't exist in v7) for the couple of call sites that need to override its height/margin.
- `Group`'s `position`/`spacing` props were renamed to `justify`/`gap` in v7 (CSS Flexbox-aligned naming). `Button`/`TextInput`/`Textarea`'s `leftIcon` prop was renamed to `leftSection`. Mantine's own `Header` layout component was removed in v7 (superseded by `AppShell.Header`, not used here) — `Navigation` renders a plain `Box component='header'` instead.
- A raw pixel breakpoint passed to v6's `theme.fn.largerThan`/`smallerThan` (e.g. `fn.largerThan(1080)`, used for a non-token breakpoint in `portfolio.tsx`) still gets converted through `em()` at 16px-base, exactly like a named breakpoint token does — so it becomes `67.5em`, not a literal `1080px`, when hand-converted to a CSS Module. Using `px` there would stop the breakpoint from tracking the user's browser default font-size (an accessibility setting `em`-based breakpoints respect and `px`-based ones don't).
