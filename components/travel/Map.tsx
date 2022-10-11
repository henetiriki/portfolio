import { styled } from '@nextui-org/react';
import {
  Children,
  FC,
  PropsWithChildren,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MAP_MAX_MOBILE, aucklandPoint, mapOptions } from '@fixtures/travel';
import { useDeepCompareEffectForMaps, useWindowSize } from '@hooks';
import { usePortfolioState } from '@state/context';

const MapContainer = styled('div', {
  h: '65vh',
  w: '100%',
});

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
      map?.panTo(aucklandPoint);
    }
  }, [map, markersLoaded, railPolylinesLoaded, tripPolylinesLoaded]);

  return (
    <>
      <MapContainer id='map' ref={mapRef} />
      {Children.map(children, child => {
        if (map && infoWindow && isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return cloneElement(child, { infoWindow, map });
        }
      })}
    </>
  );
};
