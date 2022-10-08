import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Content, Header } from '@components/content';
import { Map, Marker } from '@components/map';
import {
  City,
  Location,
  MarkerLocations,
  cities,
  markerLocations,
} from '@fixtures/map';
import { useIntersectionObserver, useMap } from '@hooks';
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
  const [dropMarkers, setDropMarkers] = useState(false);
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.8,
  });

  useEffect(() => {
    if (!dropMarkers && isVisible) {
      setDropMarkers(true);
    }
  }, [dropMarkers, isVisible]);

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
              {cities.map(
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
              {dropMarkers &&
                markerLocations.map(
                  ({ icon, locations }: MarkerLocations, order: number) =>
                    locations.map((location: Location, idx: number) => (
                      <Marker
                        {...location}
                        icon={icon}
                        idx={idx}
                        key={`${order}${idx}`}
                        order={order + 1}
                      />
                    ))
                )}
            </Map>
          </Wrapper>
          <div ref={ref} />
        </Content>
      </>
    </>
  );
};

export default Travel;
