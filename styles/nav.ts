const navActive = {
  '&.active': {
    '&:before': {
      w: '30px',
    },
  },
};

const navUnderlineBefore = {
  bgColor: '$white',
  bottom: '-10px',
  content: '',
  h: '2px',
  left: 0,
  position: 'absolute',
  transition: 'all 0.2s',
  w: 0,
};

const navUnderline = {
  '&:before': navUnderlineBefore,
  '&:hover': {
    '&:before': {
      w: '30px',
    },
    color: '$white',
  },
  color: '$white',
};

export const navLinkSm = {
  '& a': {
    color: '$white',
  },
  ...navActive,
  ...navUnderline,
  '&:before': {
    ...navUnderlineBefore,
    bottom: '8px',
  },
  my: '$md',
};

export const navLinkMd = {
  '& a': {
    color: '$white',
  },
  ...navActive,
  ...navUnderline,
};

export const navTypography = {
  fs: '$sm',
  tt: 'uppercase',
};

export const navTopContainer = {
  ai: 'center',
  d: 'flex',
  jc: 'flex-end',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    jc: 'space-between',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const navBrand = {
  '@xs': {
    w: '12%',
  },
};

export const scrollToTop = {
  '&:hover': {
    bc: '$shamrock',
  },
  bc: '$matterhorn',
  bottom: '20px',
  br: '40px',
  color: '$white',
  cursor: 'pointer',
  outline: 'none',
  p: '10px 8px 5px',
  position: 'fixed',
  right: '30px',
  ta: 'center',
  zIndex: 2,
};
