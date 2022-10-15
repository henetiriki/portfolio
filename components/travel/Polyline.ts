import { useCallback, useEffect, useState } from 'react';
import { STROKE_WEIGHT_DEFAULT, sharedPolylineOpts } from '@fixtures/travel';
import { useDeepCompareEffectForMaps } from '@hooks';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';
import { getZoomPolylineWeightExponent } from '@utils/travel';
import type { FC, PropsWithRef } from 'react';

type BuildPathProps = {
  legs?: google.maps.LatLngLiteral[];
  paths?: string[];
};

export const Polyline: FC<
  PropsWithRef<
    google.maps.PolylineOptions & {
      endRailTripPolyline?: boolean;
      endTripPolyline?: boolean;
      idx: number;
      legs?: google.maps.LatLngLiteral[];
      order?: number;
      paths?: string[];
    }
  >
> = options => {
  const { dispatch } = usePortfolioState();
  const [polyline, setPolyline] = useState<google.maps.Polyline>();
  const [polylineReady, setPolylineReady] = useState(false);
  const {
    endRailTripPolyline,
    endTripPolyline,
    idx,
    legs,
    map,
    order = 1,
    paths,
    ...polylineOpts
  } = options;

  const buildPath = useCallback<
    (props: BuildPathProps) => google.maps.LatLng[]
  >(({ legs, paths }) => {
    if (legs) {
      return legs.map(
        (point: google.maps.LatLngLiteral) => new google.maps.LatLng(point)
      );
    }

    if (paths) {
      const [path] = paths;

      return google.maps.geometry.encoding.decodePath(path);
    }

    return [];
  }, []);

  const zoomEventListener = useCallback<
    () => google.maps.MapsEventListener | undefined
  >(() => {
    if (map && polyline) {
      return google.maps.event.addListener(map, 'zoom_changed', () => {
        const strokeWeight =
          STROKE_WEIGHT_DEFAULT * getZoomPolylineWeightExponent(map.getZoom());

        if (polyline.get('strokeWeight') !== strokeWeight) {
          polyline.set('strokeWeight', strokeWeight);
        }
      });
    }

    return undefined;
  }, [map, polyline]);

  useEffect(() => {
    if (!polyline) {
      setPolyline(new google.maps.Polyline());
    }

    return () => {
      polyline?.setMap(null);
    };
  }, [polyline]);

  useDeepCompareEffectForMaps(() => {
    if (polyline && !polylineReady) {
      polyline.setOptions({
        ...sharedPolylineOpts,
        ...polylineOpts,
        path: buildPath({ legs, paths }),
      });
      setPolylineReady(true);
    }

    return () => {
      if (polylineReady) {
        setPolylineReady(false);
      }
    };
  }, [legs, paths, polyline, polylineOpts, polylineReady]);

  useEffect(() => {
    let eventListener: google.maps.MapsEventListener | undefined = undefined;

    if (map && polyline && polylineReady) {
      cancelableDelay(idx * order * 100, () => {
        polyline.setMap(map);
        eventListener = zoomEventListener();

        if (endRailTripPolyline) {
          dispatch({
            payload: { railPolylinesLoaded: true },
            type: 'set-rail-polylines-loaded',
          });
        }
        if (endTripPolyline) {
          dispatch({
            payload: { tripPolylinesLoaded: true },
            type: 'set-trip-polylines-loaded',
          });
        }
      });
    }

    return () => {
      eventListener?.remove();

      if (endRailTripPolyline) {
        dispatch({
          payload: { railPolylinesLoaded: false },
          type: 'set-rail-polylines-loaded',
        });
      }
      if (endTripPolyline) {
        dispatch({
          payload: { tripPolylinesLoaded: false },
          type: 'set-trip-polylines-loaded',
        });
      }
    };
  }, [
    endRailTripPolyline,
    endTripPolyline,
    idx,
    map,
    order,
    polyline,
    polylineReady,
    dispatch,
    zoomEventListener,
  ]);

  return null;
};
