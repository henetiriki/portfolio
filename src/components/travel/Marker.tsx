import { useReducedMotion } from '@mantine/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { markerIconPath } from '@fixtures/travel/icons';
import { cancelableDelay } from '@utils/common';
import { getZoomMarkerWeightExponent } from '@utils/travel';
import classes from './Marker.module.css';
import type { MarkerIcon } from '@fixtures/travel/types';
import type { FC } from 'react';

const svgNamespace = 'http://www.w3.org/2000/svg';

type MarkerProps = {
  description: string;
  icon: MarkerIcon;
  idx: number;
  infoWindow?: google.maps.InfoWindow;
  layerId: string;
  map?: google.maps.Map;
  onRendered: (layerId: string) => void;
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
      colour: string,
      position: google.maps.LatLngLiteral,
      scale: number,
      title: string
    ) => {
      marker.position = position;
      marker.title = title;
      path.setAttribute('fill', colour);
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
  icon,
  idx,
  infoWindow,
  layerId,
  map,
  onRendered,
  order = 1,
  position,
  title,
}) => {
  const reduceMotion = useReducedMotion();
  const [{ graphic, marker, motion, setMap, setOptions, setScale }] =
    useState(createMarkerElements);
  const renderedScaleRef = useRef(icon.scale);
  const renderedRef = useRef(false);
  const onRenderedRef = useRef(onRendered);
  const markerScale = icon.scale;

  useEffect(() => {
    onRenderedRef.current = onRendered;
  }, [onRendered]);

  const reportRendered = useCallback(() => {
    if (!renderedRef.current) {
      renderedRef.current = true;
      onRenderedRef.current(layerId);
    }
  }, [layerId]);

  useEffect(
    () => () => {
      setMap(null);
    },
    [setMap]
  );

  useEffect(() => {
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.target !== motion) {
        return;
      }

      motion.classList.remove(classes.drop);
      reportRendered();
    };

    motion.addEventListener('animationend', handleAnimationEnd);

    return () => {
      motion.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [motion, reportRendered]);

  useEffect(() => {
    setOptions(icon.colour, position, markerScale, title);
    renderedScaleRef.current = markerScale;
  }, [icon.colour, markerScale, position, setOptions, title]);

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

      if (reduceMotion) {
        reportRendered();
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
    };
  }, [idx, map, motion, order, reduceMotion, reportRendered, setMap]);

  return null;
};
