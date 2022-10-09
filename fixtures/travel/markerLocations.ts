import { airports } from '@fixtures/travel/airports';
import { airportIcon, portIcon, stationIcon } from '@fixtures/travel/icons';
import { ports } from '@fixtures/travel/ports';
import { stations } from '@fixtures/travel/stations';
import { MarkerLocations } from '@fixtures/travel/types';

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
