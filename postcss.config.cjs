// Next.js completely disables its built-in PostCSS pipeline (autoprefixer,
// flexbox bug fixes, stage-3 feature compilation) as soon as a project
// defines its own postcss.config.cjs — see
// https://nextjs.org/docs/pages/guides/post-css#customizing-plugins. So this
// config has to explicitly re-include Next's defaults (postcss-flexbugs-fixes
// + postcss-preset-env, verbatim from Next's own default postcss.config.json)
// alongside postcss-preset-mantine, rather than only listing the Mantine
// plugins.
module.exports = {
  // Key order here is execution order, not just style — postcss-preset-mantine
  // must resolve its @mixin/nesting syntax into plain CSS before Autoprefixer
  // and stage-3 feature compilation see it, so this object can't be
  // alphabetized like a plain data object (same reasoning as the
  // eslint-disable around colorOverrides in src/styles/colors.ts).
  /* eslint-disable sort-keys/sort-keys-fix */
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        // Matches Next's default: downleveling CSS custom properties for
        // IE11 isn't safe to do automatically, and would break Mantine's
        // runtime-generated `--mantine-*` variables.
        'custom-properties': false,
      },
    },
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};
