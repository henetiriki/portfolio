import { useReducedMotion } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { usePortfolioState } from '@state/context';
import { colorOverrides } from '@styles';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';
import classes from './Marker.module.css';
import type { MarkerIcon } from '@fixtures/travel/types';
import type { FC } from 'react';

const { cinder, shamrock } = colorOverrides;
const markerPath =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
const svgNamespace = 'http://www.w3.org/2000/svg';

type MarkerProps = {
  description: string;
  endMarker?: boolean;
  icon: MarkerIcon;
  idx: number;
  infoWindow?: google.maps.InfoWindow;
  map?: google.maps.Map;
  order?: number;
  position: google.maps.LatLngLiteral;
  title: string;
};

const createMarkerElements = () => {
  const marker = new google.maps.marker.AdvancedMarkerElement({
    // Match the former Symbol anchor at Point(10, 20) in its 24px view box.
    anchorLeft: '-41.6667%',
    anchorTop: '-83.3333%',
    gmpClickable: true,
  });
  const visual = document.createElement('div');
  const graphic = document.createElementNS(svgNamespace, 'svg');
  const path = document.createElementNS(svgNamespace, 'path');

  visual.className = classes.visual;
  graphic.classList.add(classes.graphic);
  graphic.setAttribute('aria-hidden', 'true');
  graphic.setAttribute('viewBox', '0 0 24 24');
  path.setAttribute('d', markerPath);
  path.setAttribute('fill-opacity', '0.95');
  graphic.append(path);
  visual.append(graphic);
  marker.append(visual);

  return {
    graphic,
    marker,
    setMap: (map: google.maps.Map | null) => {
      marker.map = map;
    },
    setOptions: (
      color: string,
      position: google.maps.LatLngLiteral,
      scale: number,
      title: string
    ) => {
      marker.position = position;
      marker.title = title;
      path.setAttribute('fill', color);
      visual.style.transform = `scale(${scale})`;
    },
    setScale: (scale: number) => {
      visual.style.transform = `scale(${scale})`;
    },
  };
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
  const [{ graphic, marker, setMap, setOptions, setScale }] =
    useState(createMarkerElements);
  const renderedScaleRef = useRef(icon.scale);
  const markerScale = icon.scale;

  useEffect(
    () => () => {
      setMap(null);
    },
    [setMap]
  );

  useEffect(() => {
    setOptions(icon.color, position, markerScale, title);
    renderedScaleRef.current = markerScale;
  }, [icon.color, markerScale, position, setOptions, title]);

  useEffect(() => {
    let bounceTimer: ReturnType<typeof setTimeout> | undefined;
    const handleClick = () => {
      if (!reduceMotion) {
        graphic.classList.remove(classes.bounce);
        // Reflow restarts the CSS animation when an active marker is clicked
        // again before its previous bounce has completed.
        void graphic.getBoundingClientRect();
        graphic.classList.add(classes.bounce);

        if (bounceTimer) {
          clearTimeout(bounceTimer);
        }

        bounceTimer = cancelableDelay(2000, () => {
          graphic.classList.remove(classes.bounce);
        });
      }
      infoWindow?.setHeaderDisabled(true);
      infoWindow?.setContent(
        `<div>
            <h4 style="color:${shamrock[4]};font-size:1rem;margin:0.25rem 0 0.45rem">${title}</h4>
            <p style="color:${cinder[4]};font-size:0.85rem;margin:0.25rem 0 0.25rem">${description}</p>
          </div>`
      );
      infoWindow?.open({ anchor: marker, map });
    };

    marker.addEventListener('gmp-click', handleClick);

    return () => {
      if (bounceTimer) {
        clearTimeout(bounceTimer);
      }

      graphic.classList.remove(classes.bounce);
      marker.removeEventListener('gmp-click', handleClick);
      infoWindow?.close();
    };
  }, [description, graphic, infoWindow, map, marker, reduceMotion, title]);

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

          if (renderedScaleRef.current !== scale) {
            setScale(scale);
            renderedScaleRef.current = scale;
          }
        })
      : undefined;

    return () => {
      eventListener?.remove();
    };
  }, [map, markerScale, setScale]);

  useEffect(() => {
    const showMarker = () => {
      if (!reduceMotion) {
        graphic.classList.add(classes.drop);
      }
      setMap(map!);

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

      graphic.classList.remove(classes.drop);

      if (endMarker) {
        dispatch({
          payload: { markersLoaded: false },
          type: 'set-markers-loaded',
        });
      }
    };
  }, [endMarker, graphic, idx, map, order, reduceMotion, setMap, dispatch]);

  return null;
};
