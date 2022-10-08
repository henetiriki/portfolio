import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import { Map } from '@components/map/Map';
import { Marker } from '@components/map/Marker';
import {
  City,
  Location,
  MarkerLocations,
  cities,
  markerLocations,
} from '@fixtures/map';
import { useIntersectionObserver, useMap } from '@hooks';

const { publicRuntimeConfig } = getConfig();

const Wrapper = dynamic(
  () => import('@googlemaps/react-wrapper').then(mod => mod.Wrapper),
  {
    ssr: false,
  }
);

export const MapWrapper: FC = () => {
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
    </>
  );
};
