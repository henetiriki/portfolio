import { FC, PropsWithRef, useCallback, useEffect, useState } from 'react';
import { useDeepCompareEffectForMaps } from '@hooks';
import { usePortfolioState } from '@state/context';
import { colors } from '@styles/shared';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';

const { cinder, shamrock } = colors;

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
  const {
    endMarker,
    icon,
    idx,
    infoWindow,
    map,
    order = 1,
    ...markerOpts
  } = options;

  const clickEventListener = useCallback<
    () => google.maps.MapsEventListener | undefined
  >(() => {
    if (marker) {
      return google.maps.event.addListener(marker, 'click', () => {
        const { description, title } = options;

        marker?.setAnimation(google.maps.Animation.BOUNCE);
        cancelableDelay(2000, () => {
          marker?.setAnimation(null);
        });
        infoWindow?.setContent(
          `<div>
            <h4 style="color:${shamrock};font-size:1rem">${title}</h4>
            <p style="color:${cinder};font-size:0.85rem">${description}</p>
          </div>`
        );
        infoWindow?.open(map, marker);
      });
    }

    return undefined;
  }, [infoWindow, map, marker, options]);

  const zoomEventListener = useCallback<
    () => google.maps.MapsEventListener | undefined
  >(() => {
    if (map && marker && markerScale) {
      return google.maps.event.addListener(map, 'zoom_changed', () => {
        const scale = markerScale * getZoomMarkerWeightExponent(map.getZoom());
        const icon: google.maps.Symbol = marker.getIcon() as google.maps.Symbol;

        if (icon.scale !== scale) {
          marker.setIcon({
            ...icon,
            scale,
          });
        }
      });
    }

    return undefined;
  }, [map, marker, markerScale]);

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    return () => {
      marker?.setMap(null);
    };
  }, [marker]);

  useDeepCompareEffectForMaps(() => {
    const eventListener: google.maps.MapsEventListener | undefined =
      clickEventListener();

    if (marker && !markerReady) {
      marker.setOptions({
        ...markerOpts,
        animation: google.maps.Animation.DROP,
        icon: {
          ...(icon as google.maps.Symbol),
          anchor: new google.maps.Point(10, 20),
        },
      });

      setMarkerScale((icon as google.maps.Symbol).scale!);
      setMarkerReady(true);
    }

    return () => {
      eventListener?.remove();
      infoWindow?.close();
    };
  }, [marker, markerOpts, markerReady, setMarkerScale]);

  useEffect(() => {
    const eventListener: google.maps.MapsEventListener | undefined =
      zoomEventListener();

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
      eventListener?.remove();
      if (endMarker) {
        dispatch({
          payload: { markersLoaded: false },
          type: 'set-markers-loaded',
        });
      }
    };
  }, [
    endMarker,
    idx,
    map,
    marker,
    markerReady,
    order,
    dispatch,
    zoomEventListener,
  ]);

  return null;
};
