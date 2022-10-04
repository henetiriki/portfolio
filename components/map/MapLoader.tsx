import { Container, Loading } from '@nextui-org/react';
import { FC } from 'react';

export const MapLoader: FC = () => (
  <Container
    css={{
      ai: 'start',
      d: 'flex',
      h: '65vh',
      jc: 'center',
      w: '100vw',
    }}>
    <Loading type='points' />
  </Container>
);
