import type { MantineTheme, Sx } from '@mantine/core';

export const aboutContainer: Sx = ({ fn: { largerThan } }: MantineTheme) => ({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  gap: '3rem',
  [largerThan('xs')]: {
    flexDirection: 'row',
  },
});

export const aboutBox: Sx = ({ fn: { largerThan } }: MantineTheme) => ({
  [largerThan('xs')]: {
    flexBasis: '60%',
  },
});

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
  marginTop: '5rem',
  maxWidth: '400px',
  [largerThan('xs')]: {
    marginTop: 0,
  },
});
