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
import { MAP_MAX_MOBILE, MAP_OPTIONS } from '@fixtures/map';
import { useWindowSize } from '@hooks';

const MapContainer = styled('div', {
  h: '65vh',
  w: '100vw',
});

export const Map: FC<PropsWithChildren<google.maps.MapOptions>> = ({
  children,
  ...options
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (mapRef.current && !map) {
      setMap(new window.google.maps.Map(mapRef.current, {}));
    }
  }, [mapRef, map]);

  useEffect(() => {
    if (map && width) {
      const mapMaxMobile = width < MAP_MAX_MOBILE;
      const zoom = mapMaxMobile ? 1 : 2;

      map.setOptions({
        ...MAP_OPTIONS,
        minZoom: zoom,
        scrollwheel: !mapMaxMobile,
        zoom,
      });
    }
  }, [map, options, width]);

  return (
    <>
      <MapContainer id='map' ref={mapRef} />
      {Children.map(children, child => {
        if (map && isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return cloneElement(child, { map });
        }
      })}
    </>
  );
};
