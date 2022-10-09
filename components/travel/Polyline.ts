import { FC, PropsWithRef, useEffect, useState } from 'react';
import { sharedPolylineOpts } from '@fixtures/travel';
import { useDeepCompareEffectForMaps } from '@hooks';
import { cancelableDelay } from '@utils/common';

export const Polyline: FC<
  PropsWithRef<
    google.maps.PolylineOptions & {
      idx: number;
      legs?: google.maps.LatLngLiteral[];
      order?: number;
      paths?: string[];
    }
  >
> = options => {
  const [polyline, setPolyline] = useState<google.maps.Polyline>();
  const [polylineReady, setPolylineReady] = useState(true);
  const { idx, legs = [], paths = [], order = 1, ...polylineOpts } = options;

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
  }, [polyline, polylineOpts]);

  useEffect(() => {
    if (polyline && polylineReady) {
      legs.forEach((point: google.maps.LatLngLiteral) => {
        cancelableDelay(idx * order * 50, () => {
          polyline.getPath().push(new google.maps.LatLng(point));
        });
      });
      paths.forEach((path: string) => {
        const pathPoints: google.maps.LatLng[] =
          google.maps.geometry.encoding.decodePath(path);

        pathPoints.forEach(({ lat, lng }: google.maps.LatLng) => {
          cancelableDelay(idx * order * 50, () => {
            polyline.getPath().push(new google.maps.LatLng({ lat: lat(), lng: lng() }));
          });
        });
      });
    }
  }, [polylineReady, polyline, legs, paths, idx, order]);

  return null;
};
