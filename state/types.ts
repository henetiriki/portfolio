import { TripPaths } from '@fixtures/travel/types';

export type Action =
  {
      payload: { railTripPolylines: TripPaths[] };
      type: 'set-rail-trip-polylines';
    } | { payload: { id: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  id?: string;
  railTripPolylines?: TripPaths[];
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
