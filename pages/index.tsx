import { Container, Text } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import { ReactElement } from 'react';
import { HomeLayout, NextPageWithLayout } from '@containers';

const TypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const Home: NextPageWithLayout = (): JSX.Element => (
  <Container
    as='section'
    css={{
      dflex: 'center',
      h: '85vh',
      zIndex: 1,
    }}>
    <Container css={{ ta: 'center' }}>
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
      <Text>ex-flight attendant turned programmer</Text>
    </Container>
  </Container>
);

Home.getLayout = (page: ReactElement): JSX.Element => (
  <HomeLayout>{page}</HomeLayout>
);

export default Home;
