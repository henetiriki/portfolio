import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { Map, Marker } from '@components/map';
import { CITIES, City } from '@fixtures/map';
import { useMap } from '@hooks';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const { publicRuntimeConfig } = getConfig();

const Wrapper = dynamic(
  () => import('@googlemaps/react-wrapper').then(mod => mod.Wrapper),
  {
    ssr: false,
  }
);

const Travel: NextPage = (): JSX.Element => {
  const { render } = useMap();

  return (
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
          <Wrapper apiKey={publicRuntimeConfig.googleApiKey} render={render}>
            <Map>
              {CITIES.map(
                ({ description, icon, position, title }: City, idx: number) => (
                  <Marker
                    description={description}
                    icon={icon}
                    idx={idx}
                    key={title}
                    position={position}
                    title={title}
                  />
                )
              )}
            </Map>
          </Wrapper>
        </Content>
      </>
    </>
  );
};

export default Travel;
