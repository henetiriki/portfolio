import { useReducedMotion, useViewportSize } from '@mantine/hooks';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MAP_MAX_MOBILE, currentCityPoint, mapOptions } from '@fixtures/travel';
import classes from './Map.module.css';
import type { FC, PropsWithChildren } from 'react';

const mapRevealDuration = 2000;
const mapRevealZoom = 4;

const easeInOutCubic = (progress: number): number =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

const interpolate = (start: number, end: number, progress: number): number =>
  start + (end - start) * progress;

const interpolateLongitude = (
  start: number,
  end: number,
  progress: number
): number => {
  const shortestDistance = ((end - start + 540) % 360) - 180;

  return start + shortestDistance * progress;
};

type MapProps = PropsWithChildren<{
  layersRendered: boolean;
  onReady: () => void;
}>;

export const Map: FC<MapProps> = ({ children, layersRendered, onReady }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const initialZoomSetRef = useRef(false);
  const revealAnimationFrameRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const { width } = useViewportSize();
  const [map, setMap] = useState<google.maps.Map>();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>();
  const [mapRendered, setMapRendered] = useState(false);

  const cancelReveal = useCallback(() => {
    if (revealAnimationFrameRef.current !== null) {
      cancelAnimationFrame(revealAnimationFrameRef.current);
      revealAnimationFrameRef.current = null;
    }
  }, []);

  const revealMap = useCallback(() => {
    const startCenter = map?.getCenter();
    const startZoom = map?.getZoom();

    if (!map || !startCenter || startZoom === undefined) {
      return;
    }

    const startLat = startCenter.lat();
    const startLng = startCenter.lng();
    const startedAt = performance.now();

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / mapRevealDuration, 1);
      const easedProgress = easeInOutCubic(progress);
      const animationComplete = progress === 1;

      map.moveCamera({
        center: animationComplete
          ? currentCityPoint
          : {
              lat: interpolate(startLat, currentCityPoint.lat, easedProgress),
              lng: interpolateLongitude(
                startLng,
                currentCityPoint.lng,
                easedProgress
              ),
            },
        zoom: animationComplete
          ? mapRevealZoom
          : interpolate(startZoom, mapRevealZoom, easedProgress),
      });

      if (!animationComplete) {
        revealAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        revealAnimationFrameRef.current = null;
        map.setOptions({ scrollwheel: true });
      }
    };

    revealAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [map]);

  useEffect(() => {
    if (mapRef.current && !map && !infoWindow) {
      setMap(new google.maps.Map(mapRef.current, mapOptions()));
      setInfoWindow(new google.maps.InfoWindow());
    }
  }, [mapRef, map, infoWindow]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const listener = google.maps.event.addListenerOnce(
      map,
      'tilesloaded',
      () => {
        setMapRendered(true);
        onReady();
      }
    );

    return () => {
      listener.remove();
    };
  }, [map, onReady]);

  useEffect(() => {
    if (map && width) {
      const mapMaxMobile = width < MAP_MAX_MOBILE;
      const minZoom = mapMaxMobile ? 1 : 2;

      map.setOptions({
        minZoom,
        // Only force the starting zoom once, on initial setup — otherwise a
        // window resize after the map has loaded would snap it back to the
        // viewport default and discard the user's own zoom level.
        ...(!initialZoomSetRef.current && { zoom: minZoom }),
      });

      initialZoomSetRef.current = true;
    }
  }, [map, width]);

  useEffect(() => {
    if (map && mapRendered && layersRendered) {
      cancelReveal();

      if (reduceMotion) {
        map.moveCamera({ center: currentCityPoint, zoom: mapRevealZoom });
        map.setOptions({ scrollwheel: true });
      } else {
        revealMap();
      }
    }

    return cancelReveal;
  }, [cancelReveal, layersRendered, map, mapRendered, reduceMotion, revealMap]);

  return (
    <>
      <div className={classes.map} id='map' ref={mapRef} />
      {Children.map(children, child => {
        if (map && infoWindow && mapRendered && isValidElement(child)) {
          // set the map prop on the child component
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return cloneElement(child, { infoWindow, map });
        }
      })}
    </>
  );
};
