import { styled } from '@nextui-org/react';
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { MAP_MAX_MOBILE_ZOOM_ZERO, MAP_OPTIONS } from '@fixtures/map';
import { useWindowSize } from '@hooks';

const MapContainer = styled('div', {
  h: '65vh',
  w: '100vw',
});

export const Map: FC = () => {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { width } = useWindowSize();
  const [map, setMap] = useState<google.maps.Map | undefined>();
  const [mapDrawn, setMapDrawn] = useState(false);

  useEffect(() => {
    if (width) {
      const zoom = width < MAP_MAX_MOBILE_ZOOM_ZERO ? 1 : 2;

      if (!map) {
        setMap(
          new window.google.maps.Map(mapRef.current, {
            ...MAP_OPTIONS,
            minZoom: zoom,
            zoom,
          })
        );
      }

      if (map) {
        map.setZoom(zoom);
      }
    }
  }, [map, width]);

  useEffect(() => {
    if (map && !mapDrawn) {
    }
  }, [map, mapDrawn]);

  return <MapContainer id='map' ref={mapRef} />;
};
