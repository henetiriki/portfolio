import type { CSS } from '@nextui-org/react';

const navActive: CSS = {
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

const navUnderline: CSS = {
  '&:before': navUnderlineBefore,
  '&:hover': {
    '&:before': {
      w: '30px',
    },
    color: '$white',
  },
  color: '$white',
};

export const navLinkSm: CSS = {
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

export const navLinkMd: CSS = {
  '& a': {
    color: '$white',
  },
  ...navActive,
  ...navUnderline,
};

export const navTypography: CSS = {
  fs: '$sm',
  tt: 'uppercase',
};

export const navTopContainer: CSS = {
  ai: 'center',
  d: 'flex',
  jc: 'flex-end',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    jc: 'space-between',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const navBrand: CSS = {
  '@xs': {
    w: '12%',
  },
};

export const scrollToTop: CSS = {
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
