import { Container, Loading } from '@nextui-org/react';
import type { FC } from 'react';

export const MapLoader: FC = () => (
  <Container
    css={{
      ai: 'flex-start',
      d: 'flex',
      h: '65vh',
      jc: 'center',
      w: '100vw',
    }}>
    <Loading css={{ pt: 'calc(2 * $xl)' }} type='points' />
  </Container>
);
