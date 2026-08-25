import { Box } from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from '@components/shared';
import { Map, MapError, MapLoader, Marker, Polyline } from '@components/travel';
import { cities, markerLocations, tripPolylines } from '@fixtures/travel';
import {
  useGoogleMaps,
  useIntersectedOnce,
  useLayerCompletion,
  useRailTrips,
} from '@hooks';
import type {
  City,
  Location,
  MarkerLocations,
  TripPaths,
  TripPolylines,
} from '@fixtures/travel/types';
import type { FC } from 'react';

type LayerType = 'city' | 'marker' | 'rail' | 'trip';

const INTERSECTION_THRESHOLD = 0.8;

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
  const [mapReady, setMapReady] = useState(false);
  const { hasIntersected: layersVisible, ref: intersectionRef } =
    useIntersectedOnce(INTERSECTION_THRESHOLD);

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

  const { handleLayerRendered, layersRendered } = useLayerCompletion({
    expectedLayerIds,
    layersStarted,
    railTripsSettled,
  });

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

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
