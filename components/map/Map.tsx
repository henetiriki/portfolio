import { styled } from '@nextui-org/react';
import { FC, MutableRefObject, useEffect, useRef } from 'react';
import { mapOptions } from '@fixtures/map';

const MapContainer = styled('div', {
  h: '65vh',
  w: '100vw',
});

export const Map: FC = () => {
  const ref = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    new window.google.maps.Map(ref.current, mapOptions);
  });

  return <MapContainer id='map' ref={ref} />;
};
