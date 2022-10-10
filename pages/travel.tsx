import { Container, Text } from '@nextui-org/react';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { Content, Header } from '@components/content';
import { Legend, MapWrapper } from '@components/travel';
import { usePortfolioState } from '@state/context';
import { travelContainerBottom, travelContainerTop } from '@styles/travel';
import { getServerSideProps } from '@utils/common';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const Travel: NextPage = ({
  data: { id },
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({ payload: { id }, type: 'set-ig-img-id' });
  }, [id, dispatch]);

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
          <MapWrapper />
          <Container css={travelContainerBottom}>
            <Legend />
          </Container>
        </Content>
      </>
    </>
  );
};

export { getServerSideProps } from '@utils/common';

export default Travel;
