import localFont from 'next/font/local';

// Provenance and refresh procedure: docs/styling-theming.md#fonts.
export const bodyFont = localFont({
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'font-stretch', value: '100%' }],
  display: 'swap',
  src: './fonts/roboto/roboto-latin.woff2',
  variable: '--portfolio-font-body',
  weight: '100 900',
});

export const headingFont = localFont({
  adjustFontFallback: 'Arial',
  display: 'swap',
  src: './fonts/montserrat/montserrat-latin.woff2',
  variable: '--portfolio-font-heading',
  weight: '100 900',
});
