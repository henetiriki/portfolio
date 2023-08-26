import { Wrapper } from '@googlemaps/react-wrapper';
import { Box } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import getConfig from 'next/config';
import { useEffect, useState } from 'react';
import { Map, Marker, Polyline } from '@components/travel';
import { cities, markerLocations, tripPolylines } from '@fixtures/travel';
import { useMap, useRailTrips } from '@hooks';
import type {
  City,
  Location,
  MarkerLocations,
  TripPaths,
  TripPolylines,
} from '@fixtures/travel/types';
import type { FC } from 'react';

const { publicRuntimeConfig } = getConfig();

export const MapWrapper: FC = () => {
  const { render } = useMap();
  const { entry, ref } = useIntersection({
    threshold: 0.8,
  });
  const railTripPolylines = useRailTrips();
  const [dropMarkers, setDropMarkers] = useState(false);

  useEffect(() => {
    if (!dropMarkers && entry?.isIntersecting) {
      setDropMarkers(true);
    }
  }, [dropMarkers, entry]);

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
                    endMarker={
                      order === markerLocations.length - 1 &&
                      idx === locations.length - 1
                    }
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
                    endTripPolyline={
                      order === tripPolylines.length - 1 &&
                      idx === trips.length - 1
                    }
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
                    endRailTripPolyline={
                      order === railTripPolylines.length - 1 &&
                      idx === tripPaths.length - 1
                    }
                    idx={railTripPolylines.length + idx + 1}
                    paths={paths}
                    {...polylineOpts}
                    key={`${railTripPolylines.length + order}${idx}`}
                    order={railTripPolylines.length + order + 1}
                  />
                ))
            )}
        </Map>
      </Wrapper>
      <Box ref={ref} />
    </>
  );
};
