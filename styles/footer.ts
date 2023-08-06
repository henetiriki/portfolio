import type { MantineTheme, Sx } from '@mantine/core';

export const footerBackground: Sx = ({
  colors: { blackRussian },
}: MantineTheme) => ({
  backgroundColor: blackRussian[4],
});

export const footerLowerBackground: Sx = ({
  colors: { blackRussian },
}: MantineTheme) => ({
  backgroundColor: blackRussian[6],
});

export const footerContainer: Sx = ({
  breakpoints,
  fn: { largerThan },
  headings: { fontFamily },
}: MantineTheme) => ({
  fontFamily,
  marginLeft: 'auto',
  marginRight: 'auto',
  [largerThan('xs')]: {
    maxWidth: breakpoints.xs,
  },
  [largerThan('sm')]: {
    maxWidth: breakpoints.sm,
  },
  [largerThan('md')]: {
    maxWidth: breakpoints.md,
  },
  [largerThan('lg')]: {
    maxWidth: breakpoints.lg,
  },
  paddingBottom: 'calc(3 * 1rem)',
  textAlign: 'center',
  width: '100%',
});

export const footerContainerBottom: Sx = (theme: MantineTheme) => ({
  ...footerContainer(theme),
  padding: '1rem',
});

export const footerLastUpdated: Sx = ({
  colors: { silver },
}: MantineTheme) => ({
  alignItems: 'center',
  color: silver[4],
  display: 'flex',
  fontSize: '0.5rem',
  justifyContent: 'center',
  marginBottom: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  opacity: 0.6,
});

export const footerLines: Sx = ({
  colors: { silver },
  fn: { largerThan },
}: MantineTheme) => ({
  borderTop: `1px solid ${silver[4]}`,
  [largerThan('md')]: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '50%',
  },
  opacity: 0.5,
  width: '100%',
});

export const footerLinksContainer: Sx = {
  alignItems: 'center',
  columnGap: '1rem',
  display: 'flex',
  flexDirection: 'row',
  flexFlow: 'wrap',
  justifyContent: 'center',
  padding: '1.25rem 0',
  rowGap: '1rem',
};

export const footerLinks: Sx = {
  '&:hover': {
    color: 'silver',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  color: 'white',
  fontSize: '1rem',
  textDecoration: 'none',
};

export const footerSocialLinks: Sx = ({
  colors: { shamrock, white },
}: MantineTheme) => ({
  '& svg': {
    height: '20px',
    width: '20px',
  },
  '&:hover': {
    color: shamrock[4],
  },
  color: white[4],
});

export const footerCopyright: Sx = ({
  colors: { shamrock },
}: MantineTheme) => ({
  color: shamrock[4],
  display: 'inline-block',
  paddingLeft: '0.75rm',
  svg: {
    display: 'inline-block',
  },
});
