import { Status, Wrapper } from '@googlemaps/react-wrapper';
import getConfig from 'next/config';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { Map, MapLoader } from '@components/map';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const { publicRuntimeConfig } = getConfig();

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <MapLoader />;
    case Status.FAILURE:
      return <>Error</>;
    case Status.SUCCESS:
      return <Map />;
  }
};

const Travel: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
    </Head>
    <>
      <Header>
        Places I’ve been
        <span>
          “you have brains in your head. you have feet in your shoes. you can
          steer yourself any direction you choose.” - dr. seuss
        </span>
      </Header>
      <Content wrapperPadding={{ padding: '4rem 0' }}>
        <Wrapper apiKey={publicRuntimeConfig.googleApiKey} render={render} />
      </Content>
    </>
  </>
);

export default Travel;
