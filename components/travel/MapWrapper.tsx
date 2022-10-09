import { Wrapper } from '@googlemaps/react-wrapper';
import getConfig from 'next/config';
import { FC, useEffect, useState } from 'react';
import { Map, Marker, Polyline } from '@components/travel';
import {
  City,
  Location,
  MarkerLocations,
  TripPaths,
  TripPolylines,
  cities,
  markerLocations,
  tripPolylines,
} from '@fixtures/travel';
import { useRailTrips } from '@hooks';
import { useIntersectionObserver, useMap } from '@hooks';

const { publicRuntimeConfig } = getConfig();

export const MapWrapper: FC = () => {
  const { render } = useMap();
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.8,
  });
  const railTripPolylines = useRailTrips();
  const [dropMarkers, setDropMarkers] = useState(false);

  useEffect(() => {
    if (!dropMarkers && isVisible) {
      setDropMarkers(true);
    }
  }, [dropMarkers, isVisible]);

  return (
    <>
      <Wrapper
        apiKey={publicRuntimeConfig.googleApiKey}
        libraries={['geometry']}
        render={render}>
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
          {dropMarkers &&
            tripPolylines.map(
              ({ polylineOpts, trips }: TripPolylines, order: number) =>
                trips.map((legs: google.maps.LatLngLiteral[], idx: number) => (
                  <Polyline
                    idx={idx + 1}
                    legs={legs}
                    {...polylineOpts}
                    key={`${order}${idx}`}
                    order={order + 1}
                  />
                ))
            )}
          {dropMarkers &&
            railTripPolylines.map(
              ({ polylineOpts, tripPaths }: TripPaths, order: number) =>
                tripPaths.map((paths: string[], idx: number) => (
                  <Polyline
                    idx={tripPolylines.length + idx + 1}
                    paths={paths}
                    {...polylineOpts}
                    key={`${tripPolylines.length + order}${idx}`}
                    order={tripPolylines.length + order + 1}
                  />
                ))
            )}
        </Map>
      </Wrapper>
      <div ref={ref} />
    </>
  );
};
