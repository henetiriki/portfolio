import { Container, Text } from '@nextui-org/react';
import { InferGetServerSidePropsType, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { usePortfolioState } from '@state/context';
import { getServerSideProps } from '@utils/common';

const TypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const Home: NextPage = ({
  data: { id },
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({ payload: { id }, type: 'set-ig-img-id' });
  }, [id, dispatch]);

  return (
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
};

export { getServerSideProps } from '@utils/common';

export default Home;
