export const footerBackground = {
  bgColor: '$blackRussian',
};

export const footerLowerBackground = {
  bgColor: '$blackRussianDarker',
};

export const footerContainer = {
  fontFamily: '$sansHeading',
  pb: 'calc(3 * $md)',
  ta: 'center',
};

export const footerLastUpdated = {
  color: '$silver',
  fs: '$xs',
  mb: 0,
  ml: 'auto',
  mr: 'auto',
  opacity: 0.6,
};

export const footerLines = {
  '@xs': {
    ml: 'auto',
    mr: 'auto',
    w: '50%',
  },
  borderTop: '1px solid $silver',
  opacity: 0.5,
};

export const footerLinksContainer = {
  columnGap: '$md',
  dflex: 'center',
  fd: 'row',
  p: '$lg 0',
  rowGap: '$md',
};

export const footerLinks = {
  '& a': {
    color: '$white',
  },
  '&:hover': {
    color: '$shamrock',
  },
  color: '$white',
};

export const footerCopyright = {
  color: '$shamrock',
  d: 'inline-block',
  pl: '$sm',
  svg: {
    d: 'inline-block',
  },
};
