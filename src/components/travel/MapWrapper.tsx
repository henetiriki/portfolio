import { Box } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import { Map, MapError, MapLoader, Marker, Polyline } from '@components/travel';
import { cities, markerLocations, tripPolylines } from '@fixtures/travel';
import { useGoogleMaps, useRailTrips } from '@hooks';
import type {
  City,
  Location,
  MarkerLocations,
  TripPaths,
  TripPolylines,
} from '@fixtures/travel/types';
import type { FC } from 'react';

export const MapWrapper: FC = () => {
  const mapStatus = useGoogleMaps();
  const railTripPolylines = useRailTrips();
  const [dropMarkers, setDropMarkers] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const intersectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || dropMarkers) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setDropMarkers(true);
            observer.disconnect();
            observerRef.current = null;
          }
        },
        { threshold: 0.8 }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [dropMarkers]
  );

  return (
    <>
      {mapStatus === 'loading' && <MapLoader />}
      {mapStatus === 'failure' && <MapError />}
      {mapStatus === 'success' && (
        <Map>
          {cities.map(
            ({ description, icon, position, title }: City, idx: number) => (
              <Marker
                description={description}
                icon={icon}
                idx={idx + 1}
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
                    idx={idx + 1}
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
      )}
      <Box ref={intersectionRef} />
    </>
  );
};
