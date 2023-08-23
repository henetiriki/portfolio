import { Container, Loader } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { FC, JSX } from 'react';

export const Transition: FC = (): JSX.Element => (
  <Container
    sx={({ fn: { rgba } }: MantineTheme) => ({
      backgroundColor: rgba('#0C0E27', 0.8),
      minHeight: '100vh',
      minWidth: '100vw',
      overflow: 'hidden',
      position: 'fixed',
      zIndex: 200,
    })}>
    <Loader
      sx={{
        left: '48vw',
        position: 'absolute',
        top: '50vh',
      }}
      type='points'
    />
  </Container>
);
