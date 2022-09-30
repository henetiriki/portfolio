import { CSS } from '@nextui-org/react';

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
  ...navActive,
  ...navUnderline,
  '&:before': {
    ...navUnderlineBefore,
    bottom: '8px',
  },
  my: '$md',
};

export const navLinkMd: CSS = {
  ...navActive,
  ...navUnderline,
};

export const navTypography: CSS = {
  fontFamily: '$sansAlt',
  fs: '$sm',
  tt: 'uppercase',
};
