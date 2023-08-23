import type { MantineTheme, Sx } from '@mantine/core';

export const openSourceLinks: Sx = {
  '&:hover': {
    textDecoration: 'none',
  },
};

export const imageContainer: Sx = ({
  colors: { whisper },
  fn: { largerThan },
}: MantineTheme) => ({
  '& img': {
    borderColor: `${whisper[4]} !important`,
    borderRadius: '0.5rem',
    borderStyle: 'solid  !important',
    borderWidth: '0.25rem  !important',
  },
  marginTop: '3rem',
  maxWidth: '400px',
  [largerThan('md')]: {
    marginTop: 0,
  },
});
