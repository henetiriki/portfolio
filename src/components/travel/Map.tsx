import styled from '@emotion/styled';
import { useViewportSize } from '@mantine/hooks';
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
import { useDeepCompareEffectForMaps } from '@hooks';
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
  const initialZoomSetRef = useRef(false);
  const { width } = useViewportSize();
  const [map, setMap] = useState<google.maps.Map>();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>();

  // Only ever called once `map` is already confirmed truthy — either from
  // the effect below (gated on `map && ...`) or recursively from its own
  // listener closing over that same guarantee — so it's safe to assert its
  // presence here rather than re-guard against a state this can't be in.
  const zoomMap = useCallback<(nextZoom: number, maxZoom: number) => void>(
    async (nextZoom: number, maxZoom: number) => {
      if (nextZoom < maxZoom) {
        const tilesLoadedEventListener: google.maps.MapsEventListener =
          google.maps.event.addListener(map!, 'zoom_changed', () => {
            google.maps.event.removeListener(tilesLoadedEventListener);
            zoomMap(map!.getZoom()! + 1, maxZoom);
          });

        await delay(80);

        map!.setZoom(nextZoom);

        return;
      }

      map!.setOptions({ scrollwheel: true });
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
      const minZoom = mapMaxMobile ? 1 : 2;

      map.setOptions({
        ...mapOptions(),
        ...options,
        minZoom,
        // Only force the starting zoom once, on initial setup — otherwise a
        // window resize after the map has loaded would snap it back to the
        // viewport default and discard the user's own zoom level.
        ...(!initialZoomSetRef.current && { zoom: minZoom }),
      });

      initialZoomSetRef.current = true;
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
