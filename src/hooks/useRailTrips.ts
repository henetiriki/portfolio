import { useEffect, useState } from 'react';
import { sharedPolylineOpts } from '@fixtures/travel';
import { usePortfolioState } from '@state/context';
import { colorOverrides } from '@styles';
import { fetcher } from '@utils/common';
import type {
  RailTripItem,
  RailTrips,
  TripPaths,
} from '@fixtures/travel/types';

const { torchRed } = colorOverrides;

export const useRailTrips = (): TripPaths[] => {
  const {
    dispatch,
    state: {
      travel: { railTripPolylines = [] },
    },
  } = usePortfolioState();
  const [fetching, setFetching] = useState(false);

  const fetchRailtrips = async (): Promise<TripPaths[]> => {
    const { trips, upcomingTrips } =
      await fetcher<RailTrips>('/api/rail-trips');

    const railTrips: string[][] = [];
    const upcomingRailTrips: string[][] = [];

    trips?.forEach(({ path }: RailTripItem, idx: number) => {
      // eslint-disable-next-line security/detect-object-injection
      railTrips[idx] = [path];
    });
    upcomingTrips?.forEach(({ path }: RailTripItem, idx: number) => {
      // eslint-disable-next-line security/detect-object-injection
      upcomingRailTrips[idx] = [path];
    });

    return [
      {
        polylineOpts: {
          ...sharedPolylineOpts,
          strokeColor: torchRed[4],
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
                strokeColor: torchRed[4],
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
    ].filter(({ tripPaths }: TripPaths) => tripPaths.length);
  };

  useEffect(() => {
    if (!railTripPolylines.length && !fetching) {
      setFetching(true);
      fetchRailtrips().then((railTripPolylines: TripPaths[]) => {
        setFetching(false);
        dispatch({
          payload: { railTripPolylines },
          type: 'set-rail-trip-polylines',
        });
      });
    }
  }, [railTripPolylines, fetching, dispatch]);

  return railTripPolylines;
};
