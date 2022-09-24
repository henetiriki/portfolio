import { CSS } from '@nextui-org/react';

const navActive: CSS = {
  '&.active': {
    '&:before': {
      width: '30px',
    },
  },
};

const navUnderlineBefore = {
  backgroundColor: '$white',
  bottom: '-10px',
  content: '',
  height: '2px',
  left: 0,
  position: 'absolute',
  transition: 'all 0.2s',
  width: 0,
};

const navUnderline: CSS = {
  '&:before': navUnderlineBefore,
  '&:hover': {
    '&:before': {
      width: '30px',
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
  marginTop: '$md',
};

export const navLinkMd: CSS = {
  ...navActive,
  ...navUnderline,
};

export const navTypography: CSS = {
  fontFamily: '$sansAlt',
  fontSize: '$sm',
  textTransform: 'uppercase',
};
