import { FC, PropsWithRef, useEffect, useState } from 'react';
import { useDeepCompareEffectForMaps } from '@hooks';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';

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
  const [markerScale, setMarkerScale] = useState<number>();
  const [clickEventListener, setClickEventListener] =
    useState<google.maps.MapsEventListener>();
  const [zoomEventListener, setZoomEventListener] =
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

  const showInfoWindow = (): void => {
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
  };

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

      if (!clickEventListener) {
        setClickEventListener(
          google.maps.event.addListener(marker, 'click', () => {
            showInfoWindow();
          })
        );
      }

      setMarkerScale((icon as google.maps.Symbol).scale!);
      setMarkerReady(true);
    }

    return () => {
      if (clickEventListener) {
        google.maps.event.removeListener(clickEventListener);
      }
      infoWindow?.close();
    };
  }, [marker, markerOpts, clickEventListener]);

  useEffect(() => {
    if (map && marker && markerReady && markerScale) {
      cancelableDelay(idx * order * 100, () => {
        marker.setMap(map);
        if (endMarker) {
          dispatch({
            payload: { markersLoaded: true },
            type: 'set-markers-loaded',
          });
        }

        setZoomEventListener(
          google.maps.event.addListener(map, 'zoom_changed', () => {
            marker.setIcon({
              ...(marker.getIcon() as google.maps.Symbol),
              scale: markerScale * getZoomMarkerWeightExponent(map.getZoom()),
            });
          })
        );
      });
    }

    return () => {
      if (zoomEventListener) {
        google.maps.event.removeListener(zoomEventListener);
      }
    };
  }, [
    markerReady,
    marker,
    markerScale,
    map,
    idx,
    order,
    endMarker,
    zoomEventListener,
    dispatch,
    setZoomEventListener,
  ]);

  return null;
};
