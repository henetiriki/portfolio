# Styling & Theming

## Stack

- **Mantine v6** is the component library and the primary styling API (`sx` prop, `createStyles`, style props like `c`, `bg`, `fz`).
- **Emotion** (`@emotion/react`, `@emotion/styled`, `@emotion/server`) is Mantine's underlying CSS-in-JS engine. `emotion.d.ts` extends Emotion's `Theme` type to Mantine's `MantineTheme` for typed `sx` callbacks. `@emotion/server` is a dependency for SSR style extraction (standard Mantine SSR setup, wired via `@mantine/next`'s `createGetInitialProps()` in `_document.tsx`).
- A couple of components (`Map`'s `MapContainer`) use `@emotion/styled` directly for a plain styled `div` where Mantine's `Box` isn't needed.

## Theme (`src/styles/theme.ts`)

```ts
export const theme: MantineThemeOverride = {
  colorScheme: 'dark',
  colors: colorOverrides,          // see below
  fontFamily: 'Roboto, ...',       // body text
  headings: { fontFamily: 'Montserrat, ...', sizes: { h1..h6 } },
  fontSizes: { xs, sm, md, lg, xl },
  loader: 'dots',
  primaryColor: 'whisper',
  primaryShade: 4,
  globalStyles: () => ({ body, h1..h6, html }),  // letter-spacing on headings, base font-size 16px
};
```

Applied once in `_app.tsx` via `<MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>`. The site is dark-mode only — there's no light theme or theme toggle.

Two Google Fonts are loaded as `<link>` tags in `_document.tsx` (not `next/font`): **Montserrat** (400/600/700) for headings, **Roboto** (400/700) for body text.

## Color palette (`src/styles/colors.ts`)

`colorOverrides` defines 17 custom Mantine color scales (each a 10-shade `Tuple<string, 10>`, index `[0]` lightest → `[9]` darkest), registered as `ExtendedCustomColor` via `mantine-custom-colors.d.ts` module augmentation so they're usable anywhere a Mantine color name is accepted (`c='shamrock'`, `color='torchRed'`, `colors: { shamrock }` in `sx` callbacks, etc.):

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

`ExtendedCustomColorOverrides = Record<ExtendedCustomColor, Tuple<string, 10>>` is the type backing this — see `mantine-custom-colors.d.ts` for the module augmentation that merges it into Mantine's own `MantineThemeColorsOverride`.

## Patterns worth knowing

- Components needing theme values inside inline styles use the `sx={({ colors, fn }: MantineTheme) => ({ ... })}` callback form, destructuring only the colors/breakpoint helpers (`fn.largerThan`, `fn.smallerThan`, `fn.rgba`) they need.
- Components needing theme values in JS logic (not styles) use `useMantineTheme()` (e.g. `Legend`, `ContactForm`).
- Repeated/parameterized styles use `createStyles(theme => ({...}))` from `@mantine/core` (e.g. `ContactForm`'s input/label classes).
- Wave dividers (`WaveWrapper`) are pre-rendered SVG files under `public/images/waves/`, not generated CSS — swapping the visual "torn paper" section transition would mean editing those SVGs rather than the component.
