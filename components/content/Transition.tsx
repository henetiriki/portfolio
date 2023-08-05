import { Container, Loader, createStyles } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { FC, JSX } from 'react';

const useTransitionStyles = createStyles(({ fn: { rgba } }: MantineTheme) => ({
  transitionWrapper: {
    backgroundColor: rgba('#0C0E27', 0.8),
    minHeight: '100vh',
    minWidth: '100vw',
    overflow: 'hidden',
    position: 'fixed',
    zIndex: 200,
  },
}));

export const Transition: FC = (): JSX.Element => {
  const {
    classes: { transitionWrapper },
  } = useTransitionStyles();

  return (
    <Container className={transitionWrapper}>
      <Loader />
    </Container>
  );
};
