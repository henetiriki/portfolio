import type { MantineTheme, Sx } from '@mantine/core';

export const footerLines: Sx = ({ colors: { silver } }: MantineTheme) => ({
  borderTop: `1px solid ${silver[4]}`,
});

export const footerLinks: Sx = ({ colors: { silver } }: MantineTheme) => ({
  '&:hover': {
    color: silver[4],
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
});

export const footerSocialLinks: Sx = ({
  colors: { shamrock },
}: MantineTheme) => ({
  '&:hover': {
    color: shamrock[4],
  },
});
