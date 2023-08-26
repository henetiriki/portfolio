import { Status } from '@googlemaps/react-wrapper';
import { MapError, MapLoader } from '@components/travel';
import type { JSX } from 'react';

export const useMap = (): {
  render: (status: Status) => JSX.Element;
} => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <MapLoader />;
      case Status.FAILURE:
        return <MapError />;
      default:
        return <></>;
    }
  };

  return { render };
};
