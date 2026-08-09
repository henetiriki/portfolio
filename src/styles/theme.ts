import { Loader, createTheme, rem } from '@mantine/core';
import { colorOverrides } from '@styles';

export const theme = createTheme({
  colors: colorOverrides,
  components: {
    Loader: Loader.extend({
      defaultProps: {
        type: 'dots',
      },
    }),
  },
  defaultRadius: 'sm',
  fontFamily:
    'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
  fontSizes: {
    lg: rem(16),
    md: rem(14),
    sm: rem(12),
    xl: rem(18),
    xs: rem(10),
  },
  headings: {
    fontFamily:
      'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    sizes: {
      h1: {
        fontSize: rem(48),
        lineHeight: rem(60),
      },
      h2: {
        fontSize: rem(32),
        lineHeight: rem(48),
      },
      h3: {
        fontSize: rem(24),
        lineHeight: rem(36),
      },
      h4: {
        fontSize: rem(20),
        lineHeight: rem(28),
      },
      h5: {
        fontSize: rem(18),
        lineHeight: rem(24),
      },
      h6: {
        fontSize: rem(14),
        lineHeight: rem(20),
      },
    },
  },
  primaryColor: 'whisper',
  primaryShade: 4,
});
