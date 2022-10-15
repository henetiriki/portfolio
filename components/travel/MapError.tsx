import { Container, Spacer, Text } from '@nextui-org/react';
import type { FC } from 'react';

export const MapError: FC = () => (
  <Container
    css={{
      dflex: 'flex-start',
      fd: 'column',
      h: '65vh',
      w: '100vw',
    }}>
    <Text h2>Something’s gone wrong</Text>
    <Spacer x={2} />
    <Text>The map failed to load - please try again later.</Text>
  </Container>
);
