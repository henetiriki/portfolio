import { useReducedMotion } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { markerIconPath } from '@fixtures/travel/icons';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';
import classes from './Marker.module.css';
import type { MarkerIcon } from '@fixtures/travel/types';
import type { FC } from 'react';

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
  const motion = document.createElement('div');
  const graphic = document.createElementNS(svgNamespace, 'svg');
  const path = document.createElementNS(svgNamespace, 'path');

  visual.className = classes.visual;
  motion.className = classes.motion;
  graphic.classList.add(classes.graphic);
  graphic.setAttribute('aria-hidden', 'true');
  graphic.setAttribute('viewBox', '0 0 24 24');
  path.setAttribute('d', markerIconPath);
  path.setAttribute('fill-opacity', '0.95');
  graphic.append(path);
  motion.append(graphic);
  visual.append(motion);
  marker.append(visual);

  return {
    graphic,
    marker,
    motion,
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

const createInfoWindowElements = (description: string, title: string) => {
  const heading = document.createElement('h4');
  const content = document.createElement('p');

  heading.className = classes.infoWindowTitle;
  heading.textContent = title;
  content.className = classes.infoWindowDescription;
  content.textContent = description;

  return { content, heading };
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
  const [{ graphic, marker, motion, setMap, setOptions, setScale }] =
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
    const handleAnimationEnd = () => {
      motion.classList.remove(classes.drop);
    };

    motion.addEventListener('animationend', handleAnimationEnd);

    return () => {
      motion.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [motion]);

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
      if (infoWindow) {
        const { content, heading } = createInfoWindowElements(
          description,
          title
        );

        infoWindow.setHeaderDisabled(false);
        infoWindow.setHeaderContent(heading);
        infoWindow.setContent(content);
        infoWindow.setOptions({ ariaLabel: title });
        infoWindow.open({ anchor: marker, map, shouldFocus: true });
      }
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
    const clearInfoWindowTimer = () => {
      if (infoWindowTimer) {
        clearTimeout(infoWindowTimer);
        infoWindowTimer = undefined;
      }
    };
    const visibleEventListener = infoWindow
      ? google.maps.event.addListener(infoWindow, 'visible', () => {
          clearInfoWindowTimer();
          if (infoWindow.isOpen) {
            infoWindowTimer = cancelableDelay(5000, () => {
              infoWindowTimer = undefined;
              infoWindow.close();
            });
          }
        })
      : undefined;
    const closeEventListener = infoWindow
      ? google.maps.event.addListener(infoWindow, 'close', clearInfoWindowTimer)
      : undefined;

    return () => {
      clearInfoWindowTimer();
      visibleEventListener?.remove();
      closeEventListener?.remove();
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
        motion.classList.add(classes.drop);
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

      motion.classList.remove(classes.drop);

      if (endMarker) {
        dispatch({
          payload: { markersLoaded: false },
          type: 'set-markers-loaded',
        });
      }
    };
  }, [endMarker, idx, map, motion, order, reduceMotion, setMap, dispatch]);

  return null;
};
