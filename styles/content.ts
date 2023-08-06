import type { MantineTheme, Sx } from '@mantine/core';

export const contentWrapper: Sx = ({
  colors: { valhalla },
  fn: { largerThan },
}: MantineTheme) => ({
  alignItems: 'flex-start',
  backgroundColor: valhalla[4],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  opacity: 0.9,
  padding: '4rem 0',
  width: '100%',
  [largerThan('xs')]: {
    padding: '4rem',
  },
});
