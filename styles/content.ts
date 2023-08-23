import type { MantineTheme, Sx } from '@mantine/core';

export const contentWrapper: Sx = ({
  colors: { valhalla },
  fn: { largerThan },
}: MantineTheme) => ({
  backgroundColor: valhalla[4],
  opacity: 0.9,
  padding: '2rem 1.5rem',
  width: '100%',
  [largerThan('xs')]: {
    padding: '4rem',
  },
});
