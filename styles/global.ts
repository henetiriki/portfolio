import { globalCss } from '@nextui-org/react';

export const globalStyles = globalCss({
  'h1, h2, h3, h4, h5, h6': { fontFamily: '$sansHeading' },
  p: {
    letterSpacing: '$normal',
    mb: '$md',
  },
});
