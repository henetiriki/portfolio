import { CSS } from '@nextui-org/react';

export const footerBackground: CSS = {
  bgColor: '$blackRussian',
};

export const footerLowerBackground: CSS = {
  bgColor: '$blackRussianDarker',
};

export const footerContainer: CSS = {
  fontFamily: '$sansHeading',
  pb: 'calc(3 * $md)',
  ta: 'center',
};

export const footerLastUpdated: CSS = {
  bottom: 0,
  color: '$silver',
  fs: '$xs',
  left: '$lg',
  opacity: 0.6,
  position: 'absolute',
};

export const footerLines: CSS = {
  '@xs': {
    ml: 'auto',
    mr: 'auto',
    w: '50%',
  },
  borderTop: '1px solid $silver',
  opacity: 0.5,
};

export const footerLinksContainer: CSS = {
  columnGap: '$md',
  dflex: 'center',
  fd: 'row',
  p: '$lg 0',
  rowGap: '$md',
};

export const footerLinks: CSS = {
  '&:hover': {
    color: '$shamrock',
  },
  color: '$white',
};

export const footerCopyright: CSS = {
  color: '$shamrock',
  d: 'inline-block',
  pl: '$sm',
  svg: {
    d: 'inline-block',
  },
};
