import { Box } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from '@components/shared';
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

type LayerType = 'city' | 'marker' | 'rail' | 'trip';

const getLayerId = (type: LayerType, order: number, idx: number): string =>
  `${type}-${order}-${idx}`;

const staticLayerIds = [
  ...cities.map((_city, idx) => getLayerId('city', 0, idx)),
  ...markerLocations.flatMap(({ locations }, order) =>
    locations.map((_location, idx) => getLayerId('marker', order, idx))
  ),
  ...tripPolylines.flatMap(({ trips }, order) =>
    trips.map((_trip, idx) => getLayerId('trip', order, idx))
  ),
];

export const MapWrapper: FC = () => {
  const mapStatus = useGoogleMaps();
  const { railTripPolylines, settled: railTripsSettled } = useRailTrips();
  const [layersVisible, setLayersVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [layersRendered, setLayersRendered] = useState(false);
  const completedLayerIdsRef = useRef(new Set<string>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const railLayerIds = useMemo(
    () =>
      railTripPolylines.flatMap(({ tripPaths }, order) =>
        tripPaths.map((_paths, idx) => getLayerId('rail', order, idx))
      ),
    [railTripPolylines]
  );
  const expectedLayerIds = useMemo(
    () => [...staticLayerIds, ...railLayerIds],
    [railLayerIds]
  );
  const layersStarted = layersVisible && mapReady;

  const finishLayersIfComplete = useCallback(() => {
    if (!layersStarted || !railTripsSettled) {
      return;
    }

    const completedLayerIds = completedLayerIdsRef.current;

    if (expectedLayerIds.every(layerId => completedLayerIds.has(layerId))) {
      setLayersRendered(true);
    }
  }, [expectedLayerIds, layersStarted, railTripsSettled]);

  const handleLayerRendered = useCallback(
    (layerId: string) => {
      completedLayerIdsRef.current.add(layerId);
      finishLayersIfComplete();
    },
    [finishLayersIfComplete]
  );

  useEffect(() => {
    finishLayersIfComplete();
  }, [
    expectedLayerIds,
    finishLayersIfComplete,
    layersStarted,
    railTripsSettled,
  ]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const intersectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || layersVisible) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setLayersVisible(true);
            observer.disconnect();
            observerRef.current = null;
          }
        },
        { threshold: 0.8 }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [layersVisible]
  );

  return (
    <>
      {mapStatus === 'loading' && <MapLoader />}
      {mapStatus === 'failure' && <MapError />}
      {mapStatus === 'success' && (
        <ErrorBoundary fallback={<MapError />}>
          <Box ref={intersectionRef}>
            <Map layersRendered={layersRendered} onReady={handleMapReady}>
              {layersStarted &&
                cities.map(
                  (
                    { description, icon, position, title }: City,
                    idx: number
                  ) => {
                    const layerId = getLayerId('city', 0, idx);

                    return (
                      <Marker
                        description={description}
                        icon={icon}
                        idx={idx + 1}
                        key={layerId}
                        layerId={layerId}
                        onRendered={handleLayerRendered}
                        position={position}
                        title={title}
                      />
                    );
                  }
                )}
              {layersStarted &&
                markerLocations.map(
                  ({ icon, locations }: MarkerLocations, order: number) =>
                    locations.map((location: Location, idx: number) => {
                      const layerId = getLayerId('marker', order, idx);

                      return (
                        <Marker
                          {...location}
                          icon={icon}
                          idx={idx + 1}
                          key={layerId}
                          layerId={layerId}
                          onRendered={handleLayerRendered}
                          order={order + 1}
                        />
                      );
                    })
                )}
              {layersStarted &&
                tripPolylines.map(
                  ({ polylineOpts, trips }: TripPolylines, order: number) =>
                    trips.map(
                      (legs: google.maps.LatLngLiteral[], idx: number) => {
                        const layerId = getLayerId('trip', order, idx);

                        return (
                          <Polyline
                            idx={idx + 1}
                            legs={legs}
                            {...polylineOpts}
                            key={layerId}
                            layerId={layerId}
                            onRendered={handleLayerRendered}
                            order={order + 1}
                          />
                        );
                      }
                    )
                )}
              {layersStarted &&
                railTripPolylines.map(
                  ({ polylineOpts, tripPaths }: TripPaths, order: number) =>
                    tripPaths.map((paths: string[], idx: number) => {
                      const layerId = getLayerId('rail', order, idx);

                      return (
                        <Polyline
                          idx={railTripPolylines.length + idx + 1}
                          paths={paths}
                          {...polylineOpts}
                          key={layerId}
                          layerId={layerId}
                          onRendered={handleLayerRendered}
                          order={railTripPolylines.length + order + 1}
                        />
                      );
                    })
                )}
            </Map>
          </Box>
        </ErrorBoundary>
      )}
    </>
  );
};
