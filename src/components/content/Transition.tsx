import { Container, Loader } from '@mantine/core';
import type { FC, JSX } from 'react';

export const Transition: FC = (): JSX.Element => (
  <Container
    bg='rgba(12, 14, 39, 0.8)'
    mih='100vh'
    miw='100vw'
    pos='fixed'
    style={{
      overflow: 'hidden',
      zIndex: 200,
    }}>
    <Loader left='48vw' pos='absolute' role='presentation' top='50vh' />
  </Container>
);
