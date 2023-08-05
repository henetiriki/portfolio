import { cruises, upcomingCruises } from '@fixtures/travel/cruises';
import { flights, upcomingFlights } from '@fixtures/travel/flights';
import { colorOverrides } from '@styles/shared';
import type { TripPolylines } from '@fixtures/travel/types';

const { corn, viking } = colorOverrides;

export const sharedPolylineOpts: google.maps.PolylineOptions = {
  geodesic: true,
  strokeOpacity: 0.9,
  strokeWeight: 1.5,
};

export const tripPolylines: TripPolylines[] = [
  {
    polylineOpts: {
      ...sharedPolylineOpts,
      strokeColor: corn[4],
    },
    trips: flights,
  },
  {
    polylineOpts: {
      ...sharedPolylineOpts,
      icons: [
        {
          icon: {
            path: 'M 0, -1 0,1',
            strokeColor: corn[4],
            strokeOpacity: 0.9,
            strokeWeight: 1.5,
          },
          offset: '0',
          repeat: '12px',
        },
      ],
      strokeOpacity: 0,
    },
    trips: upcomingFlights,
  },
  {
    polylineOpts: {
      ...sharedPolylineOpts,
      strokeColor: viking[4],
    },
    trips: cruises,
  },
  {
    polylineOpts: {
      ...sharedPolylineOpts,
      icons: [
        {
          icon: {
            path: 'M 0, -1 0,1',
            strokeColor: viking[4],
            strokeOpacity: 0.9,
            strokeWeight: 1.5,
          },
          offset: '0',
          repeat: '12px',
        },
      ],
      strokeOpacity: 0,
    },
    trips: upcomingCruises,
  },
].filter(({ trips }: TripPolylines) => trips.length);
