import { FC, PropsWithRef, useEffect, useState } from 'react';
import { useDeepCompareEffectForMaps } from '@hooks';
import { cancelableDelay } from '@utils/common';

export const Marker: FC<
  PropsWithRef<google.maps.MarkerOptions & { idx: number }>
> = options => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useDeepCompareEffectForMaps(() => {
    if (marker) {
      const { icon, idx } = options;

      cancelableDelay(idx * 250, () => {
        marker.setOptions({
          ...options,
          animation: google.maps.Animation.DROP,
          icon: {
            ...(icon as google.maps.Symbol),
            anchor: new google.maps.Point(10, 20),
          },
        });
      });
    }
  }, [marker, options]);

  return null;
};
