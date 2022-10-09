import { FC, PropsWithRef, useEffect, useState } from 'react';
import { sharedPolylineOpts } from '@fixtures/travel';
import { useDeepCompareEffectForMaps } from '@hooks';
import { cancelableDelay } from '@utils/common';

type BuildPathProps = {
  legs?: google.maps.LatLngLiteral[];
  paths?: string[];
};

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
  const [polylineReady, setPolylineReady] = useState(false);
  const { idx, legs, map, order = 1, paths, ...polylineOpts } = options;

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
        path: buildPath({ legs, paths }),
      });
      setPolylineReady(true);
    }
  }, [polyline, polylineOpts, legs, paths]);

  useEffect(() => {
    if (map && polyline && polylineReady) {
      cancelableDelay(idx * order * 100, () => polyline.setMap(map));
    }
  }, [polylineReady, polyline, map, idx, order]);

  return null;
};
