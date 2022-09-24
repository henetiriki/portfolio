import { Container, Text } from '@nextui-org/react';
import { TypeAnimation } from 'react-type-animation';
import type { NextPage } from 'next';

const Home: NextPage = (): JSX.Element => (
  <Container
    css={{
      alignItems: 'center',
      display: 'flex',
      height: '80vh',
      zIndex: 1,
    }}>
    <Container css={{ textAlign: 'center' }}>
      <Text h1>Louw Swart</Text>
      <Text css={{ span: { color: '$shamrock' } }} h4>
        I’m a{' '}
        <TypeAnimation
          repeat={Infinity}
          sequence={[
            'front-end engineer',
            1000,
            'photographer',
            1000,
            'cat parent',
            1000,
            'plane spotter',
            1000,
            'traveller',
            1000,
          ]}
          speed={20}
          wrapper='span'
        />
      </Text>
      <Text>ex-flight attendant turned programmer</Text>{' '}
    </Container>
  </Container>
);

export default Home;
