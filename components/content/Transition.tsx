import { Container, Loading } from '@nextui-org/react';
import type { FC } from 'react';

export const Transition: FC = (): JSX.Element => (
  <Container
    css={{
      bc: 'rgba(12, 14, 39, 0.80)',
      minHeight: '100vh',
      minWidth: '100vw',
      ov: 'hidden',
      position: 'fixed',
      zIndex: 200,
    }}>
    <Loading
      color='primary'
      css={{
        left: '48vw',
        position: 'absolute',
        top: '50vh',
      }}
      type='points'
    />
  </Container>
);
