import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { Map, Marker } from '@components/map';
import {
  AIRPORT_ICON,
  Airport,
  CITIES,
  City,
  PORT_ICON,
  Port,
  STATION_ICON,
  Station,
} from '@fixtures/map';
import { AIRPORTS } from '@fixtures/map/airports';
import { PORTS } from '@fixtures/map/ports';
import { STATIONS } from '@fixtures/map/stations';
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

  console.log('STATIONS', STATIONS.length);
  console.log('PORTS', PORTS.length);
  console.log('CITIES', CITIES.length);

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
              {AIRPORTS.map(
                (
                  { city, country, iataCode, position, title }: Airport,
                  idx: number
                ) => (
                  <Marker
                    description={`${city}, ${country}`}
                    icon={AIRPORT_ICON}
                    idx={idx}
                    key={title}
                    order={1}
                    position={position}
                    title={`${iataCode} // ${title}`}
                  />
                )
              )}
              {STATIONS.map(
                (
                  { city, country, position, stationCode, title }: Station,
                  idx: number
                ) => (
                  <Marker
                    description={`${city}, ${country}`}
                    icon={STATION_ICON}
                    idx={idx}
                    key={title}
                    order={2}
                    position={position}
                    title={`${stationCode} // ${title}`}
                  />
                )
              )}
              {PORTS.map(
                (
                  { city, country, portCode, position, title }: Port,
                  idx: number
                ) => (
                  <Marker
                    description={`${city}, ${country}`}
                    icon={PORT_ICON}
                    idx={idx}
                    key={title}
                    order={3}
                    position={position}
                    title={`${portCode} // ${title}`}
                  />
                )
              )}
              {CITIES.map(
                ({ description, icon, position, title }: City, idx: number) => (
                  <Marker
                    description={description}
                    icon={icon}
                    idx={idx}
                    key={title}
                    order={4}
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
