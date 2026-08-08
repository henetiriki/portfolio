import { Container, Loader } from '@mantine/core';
import type { FC, JSX } from 'react';

export const Transition: FC = (): JSX.Element => (
  <Container
    style={{
      backgroundColor: 'rgba(12, 14, 39, 0.8)',
      minHeight: '100vh',
      minWidth: '100vw',
      overflow: 'hidden',
      position: 'fixed',
      zIndex: 200,
    }}>
    <Loader
      role='presentation'
      style={{
        left: '48vw',
        position: 'absolute',
        top: '50vh',
      }}
    />
  </Container>
);
