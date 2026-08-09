import { useReducedMotion } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { usePortfolioState } from '@state/context';
import { colorOverrides } from '@styles';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';
import type { FC } from 'react';

const { cinder, shamrock } = colorOverrides;

type MarkerProps = {
  description: string;
  endMarker?: boolean;
  icon: google.maps.Symbol;
  idx: number;
  infoWindow?: google.maps.InfoWindow;
  map?: google.maps.Map;
  order?: number;
  position: google.maps.LatLngLiteral;
  title: string;
};

export const Marker: FC<MarkerProps> = ({
  description,
  endMarker,
  icon,
  idx,
  infoWindow,
  map,
  order = 1,
  position,
  title,
}) => {
  const { dispatch } = usePortfolioState();
  const reduceMotion = useReducedMotion();
  const [marker] = useState(() => new google.maps.Marker());
  const markerScale = icon.scale!;

  useEffect(
    () => () => {
      marker.setMap(null);
    },
    [marker]
  );

  useEffect(() => {
    marker.setOptions({
      animation: reduceMotion ? null : google.maps.Animation.DROP,
      icon: {
        ...icon,
        anchor: new google.maps.Point(10, 20),
      },
      position,
      title,
    });
  }, [icon, marker, position, reduceMotion, title]);

  useEffect(() => {
    let bounceTimer: ReturnType<typeof setTimeout> | undefined;
    const eventListener = google.maps.event.addListener(marker, 'click', () => {
      if (!reduceMotion) {
        marker.setAnimation(google.maps.Animation.BOUNCE);

        if (bounceTimer) {
          clearTimeout(bounceTimer);
        }

        bounceTimer = cancelableDelay(2000, () => {
          marker.setAnimation(null);
        });
      }
      infoWindow?.setHeaderDisabled(true);
      infoWindow?.setContent(
        `<div>
            <h4 style="color:${shamrock[4]};font-size:1rem;margin:0.25rem 0 0.45rem">${title}</h4>
            <p style="color:${cinder[4]};font-size:0.85rem;margin:0.25rem 0 0.25rem">${description}</p>
          </div>`
      );
      infoWindow?.open(map, marker);
    });

    return () => {
      if (bounceTimer) {
        clearTimeout(bounceTimer);
      }

      eventListener.remove();
      infoWindow?.close();
    };
  }, [description, infoWindow, map, marker, reduceMotion, title]);

  useEffect(() => {
    let infoWindowTimer: ReturnType<typeof setTimeout> | undefined;
    const eventListener = infoWindow
      ? google.maps.event.addListener(infoWindow, 'visible', () => {
          if (infoWindowTimer) {
            clearTimeout(infoWindowTimer);
          }
          if (infoWindow.isOpen) {
            infoWindowTimer = cancelableDelay(5000, () => {
              infoWindow.close();
            });
          }
        })
      : undefined;

    return () => {
      if (infoWindowTimer) {
        clearTimeout(infoWindowTimer);
      }

      eventListener?.remove();
    };
  }, [infoWindow]);

  useEffect(() => {
    const eventListener = map
      ? google.maps.event.addListener(map, 'zoom_changed', () => {
          const scale =
            markerScale * getZoomMarkerWeightExponent(map.getZoom());
          const icon = marker.getIcon() as google.maps.Symbol;

          if (icon.scale !== scale) {
            marker.setIcon({
              ...icon,
              scale,
            });
          }
        })
      : undefined;

    return () => {
      eventListener?.remove();
    };
  }, [map, marker, markerScale]);

  useEffect(() => {
    const showMarker = () => {
      marker.setMap(map!);

      if (endMarker) {
        dispatch({
          payload: { markersLoaded: true },
          type: 'set-markers-loaded',
        });
      }
    };
    let entranceTimer: ReturnType<typeof setTimeout> | undefined;

    if (map) {
      if (reduceMotion) {
        showMarker();
      } else {
        entranceTimer = cancelableDelay(idx * order * 100, showMarker);
      }
    }

    return () => {
      if (entranceTimer) {
        clearTimeout(entranceTimer);
      }

      if (endMarker) {
        dispatch({
          payload: { markersLoaded: false },
          type: 'set-markers-loaded',
        });
      }
    };
  }, [endMarker, idx, map, marker, order, reduceMotion, dispatch]);

  return null;
};
