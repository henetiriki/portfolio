import { useEffect, useState } from 'react';
import { STROKE_WEIGHT_DEFAULT, sharedPolylineOpts } from '@fixtures/travel';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';
import { getZoomPolylineWeightExponent } from '@utils/travel';
import type { FC } from 'react';

type BuildPathProps = {
  legs?: google.maps.LatLngLiteral[];
  paths?: string[];
};

type PolylineProps = Pick<
  google.maps.PolylineOptions,
  | 'geodesic'
  | 'icons'
  | 'map'
  | 'strokeColor'
  | 'strokeOpacity'
  | 'strokeWeight'
> & {
  endRailTripPolyline?: boolean;
  endTripPolyline?: boolean;
  idx: number;
  legs?: google.maps.LatLngLiteral[];
  order?: number;
  paths?: string[];
};

const buildPath = ({ legs, paths }: BuildPathProps): google.maps.LatLng[] => {
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
};

export const Polyline: FC<PolylineProps> = ({
  endRailTripPolyline,
  endTripPolyline,
  geodesic = sharedPolylineOpts.geodesic,
  icons,
  idx,
  legs,
  map,
  order = 1,
  paths,
  strokeColor,
  strokeOpacity = sharedPolylineOpts.strokeOpacity,
  strokeWeight = sharedPolylineOpts.strokeWeight,
}) => {
  const { dispatch } = usePortfolioState();
  const [polyline] = useState(() => new google.maps.Polyline());

  useEffect(
    () => () => {
      polyline.setMap(null);
    },
    [polyline]
  );

  useEffect(() => {
    polyline.setOptions({
      geodesic,
      icons,
      path: buildPath({ legs, paths }),
      strokeColor,
      strokeOpacity,
      strokeWeight,
    });
  }, [
    geodesic,
    icons,
    legs,
    paths,
    polyline,
    strokeColor,
    strokeOpacity,
    strokeWeight,
  ]);

  useEffect(() => {
    let eventListener: google.maps.MapsEventListener | undefined;

    if (map) {
      cancelableDelay(idx * order * 100, () => {
        polyline.setMap(map);
        eventListener = google.maps.event.addListener(
          map,
          'zoom_changed',
          () => {
            const nextStrokeWeight =
              STROKE_WEIGHT_DEFAULT *
              getZoomPolylineWeightExponent(map.getZoom());

            if (polyline.get('strokeWeight') !== nextStrokeWeight) {
              polyline.set('strokeWeight', nextStrokeWeight);
            }
          }
        );

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
    dispatch,
  ]);

  return null;
};
