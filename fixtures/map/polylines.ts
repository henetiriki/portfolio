import { cruises, upcomingCruises } from '@fixtures/map/cruises';
import { flights, upcomingFlights } from '@fixtures/map/flights';
import { TripPolylines } from '@fixtures/map/types';
import { corn, darkCyan } from '@styles/shared';

export const sharedPolylineOpts: google.maps.PolylineOptions = {
  geodesic: true,
  strokeOpacity: 0.9,
  strokeWeight: 1.5,
};

export const tripPolylines: TripPolylines[] = [
  {
    polylineOpts: {
      ...sharedPolylineOpts,
      strokeColor: corn,
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
            strokeColor: corn,
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
      strokeColor: darkCyan,
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
            strokeColor: darkCyan,
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
];
