import { rem } from '@mantine/core';
import type { MantineTheme, Sx } from '@mantine/core';

const navActive: Sx = {
  '&.active': {
    '&:before': {
      width: '30px',
    },
  },
};

const navUnderlineBefore: Sx = ({ white }: MantineTheme) => ({
  backgroundColor: white,
  bottom: rem(-10),
  content: "''",
  height: '2px',
  position: 'absolute',
  transition: 'all 0.2s',
  width: 0,
});

const navUnderline: Sx = (theme: MantineTheme) => {
  const {
    colors: { silver },
    white,
  } = theme;

  return {
    '&:before': { ...navUnderlineBefore(theme) },
    '&:hover': {
      '&:before': {
        width: '30px',
      },
      color: silver[4],
      textDecoration: 'none',
      transition: 'all 0.2s',
    },
    color: white,
  };
};

const navLink: Sx = ({
  fn: { smallerThan },
  spacing: { md },
  white,
}: MantineTheme) => ({
  alignItems: 'center',
  color: white,
  display: 'flex',
  fontWeight: 600,
  height: '100%',
  [smallerThan('sm')]: {
    alignItems: 'center',
    display: 'flex',
    height: rem(42),
    width: '100%',
  },
  paddingLeft: md,
  paddingRight: md,
  textDecoration: 'none',
  textTransform: 'uppercase',
});

export const navLinkSm: Sx = (theme: MantineTheme) => ({
  ...navActive,
  ...navLink(theme),
  ...navUnderline(theme),
  '&:before': {
    ...navUnderlineBefore(theme),
    bottom: '8px',
  },
  marginBottom: '1rem',
  marginTop: '1rem',
});

export const navLinkMd: Sx = (theme: MantineTheme) => ({
  ...navActive,
  ...navLink(theme),
  ...navUnderline(theme),
  fontSize: rem(14),
});

export const navHiddenMobile: Sx = ({ fn: { smallerThan } }: MantineTheme) => ({
  [smallerThan('sm')]: {
    display: 'none',
  },
  height: '100%',
});

export const navHiddenDesktop: Sx = ({ fn: { largerThan } }: MantineTheme) => ({
  [largerThan('sm')]: {
    display: 'none',
  },
});

export const navDrawer: Sx = (theme: MantineTheme) => {
  const {
    colors: { blackRussian },
  } = theme;

  return {
    ...navHiddenDesktop(theme),
    '& section': {
      '& div': { backgroundColor: blackRussian[6] },
      overflow: 'hidden',
    },
  };
};
