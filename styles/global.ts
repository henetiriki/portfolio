import { globalCss } from '@nextui-org/react';

export const globalStyles = globalCss({
  body: {
    '& h1, h2, h3, h4, h5': { fontFamily: '$sansHeading' },
    '& p': {
      letterSpacing: '$normal',
      mb: '$md',
    },
  },
});
