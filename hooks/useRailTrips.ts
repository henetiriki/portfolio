import { useEffect, useState } from 'react';
import { RailTripItem, RailTrips } from '@fixtures/travel';
import { fetcher } from '@utils/common';

export const useRailTrips = () => {
  const [railTrips, setRailTrips] = useState<RailTripItem[]>();
  const [upcomingRailTrips, setUpcomingRailTrips] = useState<RailTripItem[]>();

  const fetchRailtrips = async () => {
    const { trips, upcomingTrips } = await fetcher<RailTrips>(
      '/api/rail-trips'
    );

    setRailTrips(trips);
    setUpcomingRailTrips(upcomingTrips);
  };

  useEffect(() => {
    fetchRailtrips().then();
  }, []);

  return { railTrips, upcomingRailTrips };
};
