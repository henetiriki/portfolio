import { Container, Text } from '@nextui-org/react';
import { InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';
import { Content, Header } from '@components/content';
import { Legend, MapLoader } from '@components/travel';
import { description } from '@fixtures/travel';
import { usePortfolioState } from '@state/context';
import { travelContainerBottom, travelContainerTop } from '@styles/travel';
import { getStaticProps } from '@utils/common';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const DynamicMapWrapper = dynamic(
  () => import('@components/travel').then(mod => mod.MapWrapper),
  {
    loading: () => <MapLoader />,
    ssr: false,
  }
);

const Travel: NextPage = ({
  data: { imgId },
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({
      payload: {
        imgId,
      },
      type: 'set-ig-img-id',
    });
    dispatch({
      payload: {},
      type: 'reset-markers-polyline-loaded',
    });
  }, [imgId, dispatch]);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Travel')}</title>
        <meta
          content='“You have brains in your head. You have feet in your shoes. You can
            steer yourself any direction you choose.” - Dr. Seuss'
          key='pageDescription'
          name='description'
        />
        <meta
          content='planes trains ferries cruise ships'
          key='pageKeywords'
          name='keywords'
        />
        <meta
          content={description}
          key='twitterDescription'
          name='twitter:description'
        />
        <meta
          content={description}
          key='ogDescription'
          property='og:description'
        />
      </Head>
      <>
        <Header>
          Places I’ve been
          <span>
            “you have brains in your head. you have feet in your shoes. you can
            steer yourself any direction you choose.” - dr. seuss
          </span>
        </Header>
        <Content wrapperPadding={{ padding: '0' }}>
          <Container css={travelContainerTop}>
            <Text h2>Travel history</Text>
          </Container>
          <DynamicMapWrapper />
          <Container css={travelContainerBottom}>
            <Legend />
          </Container>
        </Content>
      </>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Travel;
