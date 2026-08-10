import { useReducedMotion } from '@mantine/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { STROKE_WEIGHT_DEFAULT, sharedPolylineOpts } from '@fixtures/travel';
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
  idx: number;
  layerId: string;
  legs?: google.maps.LatLngLiteral[];
  onRendered: (layerId: string) => void;
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
  geodesic = sharedPolylineOpts.geodesic,
  icons,
  idx,
  layerId,
  legs,
  map,
  onRendered,
  order = 1,
  paths,
  strokeColor,
  strokeOpacity = sharedPolylineOpts.strokeOpacity,
  strokeWeight = sharedPolylineOpts.strokeWeight,
}) => {
  const reduceMotion = useReducedMotion();
  const [polyline] = useState(() => new google.maps.Polyline());
  const renderedRef = useRef(false);
  const onRenderedRef = useRef(onRendered);

  useEffect(() => {
    onRenderedRef.current = onRendered;
  }, [onRendered]);

  const reportRendered = useCallback(() => {
    if (!renderedRef.current) {
      renderedRef.current = true;
      onRenderedRef.current(layerId);
    }
  }, [layerId]);

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
    const showPolyline = () => {
      polyline.setMap(map!);
      eventListener = google.maps.event.addListener(
        map!,
        'zoom_changed',
        () => {
          const nextStrokeWeight =
            STROKE_WEIGHT_DEFAULT *
            getZoomPolylineWeightExponent(map!.getZoom());

          if (polyline.get('strokeWeight') !== nextStrokeWeight) {
            polyline.set('strokeWeight', nextStrokeWeight);
          }
        }
      );
      reportRendered();
    };
    let entranceTimer: ReturnType<typeof setTimeout> | undefined;

    if (map) {
      if (reduceMotion) {
        showPolyline();
      } else {
        entranceTimer = cancelableDelay(idx * order * 100, showPolyline);
      }
    }

    return () => {
      if (entranceTimer) {
        clearTimeout(entranceTimer);
      }

      eventListener?.remove();
    };
  }, [idx, map, order, polyline, reduceMotion, reportRendered]);

  return null;
};
