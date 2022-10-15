import { FC, PropsWithRef, useCallback, useEffect, useState } from 'react';
import { useDeepCompareEffectForMaps } from '@hooks';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';

export const Marker: FC<
  PropsWithRef<
    google.maps.MarkerOptions & {
      description: string;
      endMarker?: boolean;
      idx: number;
      infoWindow?: google.maps.InfoWindow;
      order?: number;
    }
  >
> = options => {
  const { dispatch } = usePortfolioState();
  const [marker, setMarker] = useState<google.maps.Marker>();
  const [markerReady, setMarkerReady] = useState(false);
  const [eventListener, setEventListener] =
    useState<google.maps.MapsEventListener>();
  const {
    endMarker,
    icon,
    idx,
    infoWindow,
    map,
    order = 1,
    ...markerOpts
  } = options;

  const showInfoWindow = useCallback<() => void>(() => {
    const { description, title } = options;

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
  }, [map, marker, infoWindow, options]);

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
      marker.setOptions({
        ...markerOpts,
        animation: google.maps.Animation.DROP,
        icon: {
          ...(icon as google.maps.Symbol),
          anchor: new google.maps.Point(10, 20),
        },
      });

      if (!eventListener) {
        setEventListener(
          google.maps.event.addListener(marker, 'click', () => {
            showInfoWindow();
          })
        );
      }

      setMarkerReady(true);
    }

    return () => {
      if (eventListener) {
        google.maps.event.removeListener(eventListener);
      }
      infoWindow?.close();
    };
  }, [marker, markerOpts, eventListener]);

  useEffect(() => {
    if (map && marker && markerReady) {
      cancelableDelay(idx * order * 100, () => {
        marker.setMap(map);
        if (endMarker) {
          dispatch({
            payload: { markersLoaded: true },
            type: 'set-markers-loaded',
          });
        }
      });
    }

    return () => {
      if (endMarker) {
        dispatch({
          payload: { markersLoaded: false },
          type: 'set-markers-loaded',
        });
      }
    };
  }, [markerReady, marker, map, idx, order, endMarker, dispatch]);

  return null;
};
