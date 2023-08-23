import styled from '@emotion/styled';
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
import { useDeepCompareEffectForMaps, useWindowSize } from '@hooks';
import { usePortfolioState } from '@state/context';
import { delay } from '@utils/common';
import type { FC, PropsWithChildren } from 'react';

const MapContainer = styled.div`
  height: 65vh;
  width: 100%;
`;

export const Map: FC<PropsWithChildren<google.maps.MapOptions>> = ({
  children,
  ...options
}) => {
  const {
    state: {
      travel: { markersLoaded, railPolylinesLoaded, tripPolylinesLoaded },
    },
  } = usePortfolioState();
  const mapRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [map, setMap] = useState<google.maps.Map>();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>();

  const zoomMap = useCallback<(nextZoom: number, maxZoom: number) => void>(
    (nextZoom = 0, maxZoom = 0) => {
      if (map) {
        if (nextZoom < maxZoom) {
          const tilesLoadedEventListener: google.maps.MapsEventListener =
            google.maps.event.addListener(map, 'zoom_changed', () => {
              google.maps.event.removeListener(tilesLoadedEventListener);
              zoomMap(map.getZoom()! + 1, maxZoom);
            });

          delay(80).then(() => {
            map.setZoom(nextZoom);
          });

          return;
        }

        map.setOptions({ scrollwheel: true });
      }
    },
    [map]
  );

  useEffect(() => {
    if (mapRef.current && !map && !infoWindow) {
      setMap(new google.maps.Map(mapRef.current, {}));
      setInfoWindow(new google.maps.InfoWindow());
    }
  }, [mapRef, map, infoWindow]);

  useDeepCompareEffectForMaps(() => {
    if (map && width) {
      const mapMaxMobile = width < MAP_MAX_MOBILE;
      const zoom = mapMaxMobile ? 1 : 2;

      map.setOptions({
        ...mapOptions(),
        ...options,
        minZoom: zoom,
        zoom,
      });
    }
  }, [map, options, width]);

  useEffect(() => {
    if (map && markersLoaded && railPolylinesLoaded && tripPolylinesLoaded) {
      map.panTo(aucklandPoint);
      zoomMap(map.getZoom()! + 1, 5);
    }
  }, [map, markersLoaded, railPolylinesLoaded, tripPolylinesLoaded, zoomMap]);

  return (
    <>
      <MapContainer id='map' ref={mapRef} />
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
