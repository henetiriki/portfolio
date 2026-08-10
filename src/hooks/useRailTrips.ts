import { useEffect, useMemo, useRef } from 'react';
import { sharedPolylineOpts } from '@fixtures/travel';
import { usePortfolioState } from '@state/context';
import { colorOverrides } from '@styles';
import { fetcher } from '@utils/common';
import type {
  RailTripItem,
  RailTrips,
  TripPaths,
} from '@fixtures/travel/types';

const { ['torch-red']: torchRed } = colorOverrides;

type RailTripResult = {
  railTripPolylines: TripPaths[];
  settled: boolean;
};

export const useRailTrips = (): RailTripResult => {
  const {
    dispatch,
    state: {
      travel: { railTripPolylines: cachedRailTripPolylines },
    },
  } = usePortfolioState();
  const requestStartedRef = useRef(false);
  const railTripPolylines = useMemo(
    () => cachedRailTripPolylines ?? [],
    [cachedRailTripPolylines]
  );

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
    if (cachedRailTripPolylines === undefined && !requestStartedRef.current) {
      requestStartedRef.current = true;
      fetchRailtrips()
        .then((railTripPolylines: TripPaths[]) => {
          dispatch({
            payload: { railTripPolylines },
            type: 'set-rail-trip-polylines',
          });
        })
        .catch(() => {
          console.error('Unable to load rail-trip map data');
          dispatch({
            payload: { railTripPolylines: [] },
            type: 'set-rail-trip-polylines',
          });
        });
    }
  }, [cachedRailTripPolylines, dispatch]);

  return {
    railTripPolylines,
    settled: cachedRailTripPolylines !== undefined,
  };
};
