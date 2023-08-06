import { rem } from '@mantine/core';
import { colorOverrides } from '@styles/shared/colors';
import type { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  colorScheme: 'dark',
  colors: colorOverrides,
  fontFamily:
    'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
  fontSizes: {
    lg: rem(16),
    md: rem(14),
    sm: rem(12),
    xl: rem(18),
    xs: rem(10),
  },
  globalStyles: () => ({
    body: {
      color: 'white',
      lineHeight: rem(24),
      minHeight: '100%',
      overflowX: 'hidden',
      padding: 0,
      position: 'relative',
      textRendering: 'optimizeLegibility',
    },
    html: {
      fontSize: '16px',
    },
  }),
  headings: {
    fontFamily:
      'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    sizes: {
      h1: {
        fontSize: rem(48),
        lineHeight: '1.25', // 60px
      },
      h2: {
        fontSize: rem(32),
        lineHeight: '1.5', // 48px
      },
      h3: {
        fontSize: rem(24),
        lineHeight: '1.5', // 36px
      },
      h4: {
        fontSize: rem(20),
        lineHeight: '1.5', // 28px
      },
      h5: {
        fontSize: rem(18),
        lineHeight: '1.333', // 24px
      },
      h6: {
        fontSize: rem(14),
        lineHeight: '1.42', // 20px
      },
    },
  },
  loader: 'dots',
  primaryColor: 'white',
  primaryShade: 4,
};
