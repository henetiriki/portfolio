import { Status } from '@googlemaps/react-wrapper';
import { Map, MapError, MapLoader } from '@components/map';

export const useMap = (): { render: (status: Status) => JSX.Element } => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <MapLoader />;
      case Status.FAILURE:
        return <MapError />;
      case Status.SUCCESS:
        return <Map />;
    }
  };

  return { render };
};
