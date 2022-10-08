import { airports } from '@fixtures/map/airports';
import { airportIcon, portIcon, stationIcon } from '@fixtures/map/icons';
import { ports } from '@fixtures/map/ports';
import { stations } from '@fixtures/map/stations';
import { MarkerLocations } from '@fixtures/map/types';

export const markerLocations: MarkerLocations[] = [
  {
    icon: airportIcon,
    locations: airports,
  },
  {
    icon: stationIcon,
    locations: stations,
  },
  {
    icon: portIcon,
    locations: ports,
  },
];
