import { FC, PropsWithRef, useEffect, useState } from 'react';
import { useDeepCompareEffectForMaps } from '@hooks';
import { cancelableDelay } from '@utils/common';

export const Marker: FC<
  PropsWithRef<
    google.maps.MarkerOptions & {
      description: string;
      idx: number;
      infoWindow?: google.maps.InfoWindow;
      order?: number;
    }
  >
> = options => {
  const [marker, setMarker] = useState<google.maps.Marker>();
  const [eventListener, setEventListener] =
    useState<google.maps.MapsEventListener>();

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
    const { icon, idx, infoWindow, order = 1, ...markerOpts } = options;

    if (marker) {
      cancelableDelay(idx * order * 100, () => {
        marker.setOptions({
          ...markerOpts,
          animation: google.maps.Animation.DROP,
          icon: {
            ...(icon as google.maps.Symbol),
            anchor: new google.maps.Point(10, 20),
          },
        });
      });

      if (!eventListener) {
        setEventListener(
          google.maps.event.addListener(marker, 'click', () => {
            showInfoWindow();
          })
        );
      }
    }

    return () => {
      if (eventListener) {
        google.maps.event.removeListener(eventListener);
      }
      infoWindow?.close();
    };
  }, [marker, options, eventListener]);

  const showInfoWindow = (): void => {
    const { description, infoWindow, map, title } = options;

    marker?.setAnimation(google.maps.Animation.BOUNCE);
    cancelableDelay(2000, () => {
      marker?.setAnimation(null);
    });
    infoWindow?.setContent(
      `<div>
          <h4 style="color:#27e278;font-size:1rem">${title}</h4>
          <p style="color:#292b2c;font-size:0.85rem">${description}</p>
      </div>`
    );
    infoWindow?.open(map, marker);
  };

  return null;
};
