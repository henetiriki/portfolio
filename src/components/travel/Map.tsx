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
import { MAP_MAX_MOBILE, aucklandPoint, mapOptions } from '@fixtures/travel';
import { usePortfolioState } from '@state/context';
import { cancelableDelay } from '@utils/common';
import type { FC, PropsWithChildren } from 'react';

const mapContainerStyle = { height: '65vh', width: '100%' };
const mapRevealZoom = 4;

export const Map: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: {
      travel: { markersLoaded, railPolylinesLoaded, tripPolylinesLoaded },
    },
  } = usePortfolioState();
  const mapRef = useRef<HTMLDivElement>(null);
  const initialZoomSetRef = useRef(false);
  const zoomEventListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  );
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const { width } = useViewportSize();
  const [map, setMap] = useState<google.maps.Map>();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>();

  const cancelZoom = useCallback(() => {
    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }

    zoomEventListenerRef.current?.remove();
    zoomEventListenerRef.current = null;
  }, []);

  const zoomMap = useCallback<(nextZoom: number, maxZoom: number) => void>(
    function stepZoom(nextZoom: number, maxZoom: number) {
      if (nextZoom < maxZoom) {
        zoomEventListenerRef.current = google.maps.event.addListener(
          map!,
          'zoom_changed',
          () => {
            zoomEventListenerRef.current?.remove();
            zoomEventListenerRef.current = null;
            stepZoom(map!.getZoom()! + 1, maxZoom);
          }
        );

        zoomTimerRef.current = cancelableDelay(80, () => {
          zoomTimerRef.current = null;
          map!.setZoom(nextZoom);
        });

        return;
      }

      map!.setOptions({ scrollwheel: true });
    },
    [map]
  );

  useEffect(() => {
    if (mapRef.current && !map && !infoWindow) {
      setMap(new google.maps.Map(mapRef.current, mapOptions()));
      setInfoWindow(new google.maps.InfoWindow());
    }
  }, [mapRef, map, infoWindow]);

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
    if (map && markersLoaded && railPolylinesLoaded && tripPolylinesLoaded) {
      cancelZoom();
      map.panTo(aucklandPoint);

      if (reduceMotion) {
        map.setOptions({ scrollwheel: true, zoom: mapRevealZoom });
      } else {
        zoomMap(map.getZoom()! + 1, mapRevealZoom + 1);
      }
    }

    return cancelZoom;
  }, [
    cancelZoom,
    map,
    markersLoaded,
    railPolylinesLoaded,
    reduceMotion,
    tripPolylinesLoaded,
    zoomMap,
  ]);

  return (
    <>
      <div id='map' ref={mapRef} style={mapContainerStyle} />
      {Children.map(children, child => {
        if (map && infoWindow && isValidElement(child)) {
          // set the map prop on the child component
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return cloneElement(child, { infoWindow, map });
        }
      })}
    </>
  );
};
