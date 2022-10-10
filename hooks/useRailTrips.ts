import { useEffect, useState } from 'react';
import { sharedPolylineOpts } from '@fixtures/travel';
import { RailTripItem, RailTrips, TripPaths } from '@fixtures/travel/types';
import { colors } from '@styles/shared';
import { fetcher } from '@utils/common';

const { torchRed } = colors;

export const useRailTrips = (): TripPaths[] => {
  const [railTripPolylines, setRailTripPolylines] = useState<TripPaths[]>([]);

  const fetchRailtrips = async () => {
    const { trips, upcomingTrips } = await fetcher<RailTrips>(
      '/api/rail-trips'
    );

    const railTrips: string[][] = [];
    const upcomingRailTrips: string[][] = [];

    trips?.forEach(({ path }: RailTripItem, idx: number) => {
      railTrips[idx] = [path];
    });
    upcomingTrips?.forEach(({ path }: RailTripItem, idx: number) => {
      upcomingRailTrips[idx] = [path];
    });

    const polylines: TripPaths[] = [
      {
        polylineOpts: {
          ...sharedPolylineOpts,
          strokeColor: torchRed,
        },
        tripPaths: railTrips,
      },
      {
        polylineOpts: {
          ...sharedPolylineOpts,
          icons: [
            {
              icon: {
                path: 'M 0, -1 0,1',
                strokeColor: torchRed,
                strokeOpacity: 0.9,
                strokeWeight: 1.5,
              },
              offset: '0',
              repeat: '12px',
            },
          ],
          strokeOpacity: 0,
        },
        tripPaths: upcomingRailTrips,
      },
    ];

    setRailTripPolylines(polylines);
  };

  useEffect(() => {
    fetchRailtrips().then();
  }, []);

  return railTripPolylines;
};
