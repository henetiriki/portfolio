import { FC, PropsWithRef, useEffect, useState } from 'react';
import { sharedPolylineOpts } from '@fixtures/map';
import { useDeepCompareEffectForMaps } from '@hooks';
import { cancelableDelay } from '@utils/common';
import LatLngLiteral = google.maps.LatLngLiteral;

export const Polyline: FC<
  PropsWithRef<
    google.maps.PolylineOptions & {
      idx: number;
      journeys: google.maps.LatLngLiteral[];
      order?: number;
    }
  >
> = options => {
  const [polyline, setPolyline] = useState<google.maps.Polyline>();
  const [polylineReady, setPolylineReady] = useState(true);
  const { idx, journeys, order = 1, ...polylineOpts } = options;

  useEffect(() => {
    if (!polyline) {
      setPolyline(new google.maps.Polyline());
    }

    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [polyline]);

  useDeepCompareEffectForMaps(() => {
    if (polyline) {
      polyline.setOptions({
        ...sharedPolylineOpts,
        ...polylineOpts,
      });
      setPolylineReady(true);
    }
  }, [polyline, options]);

  useEffect(() => {
    if (polyline && polylineReady) {
      journeys.forEach((point: LatLngLiteral) => {
        cancelableDelay(idx * order, () => {
          polyline.getPath().push(new google.maps.LatLng(point));
        });
      });
    }
  }, [polylineReady, polyline, journeys]);

  return null;
};
