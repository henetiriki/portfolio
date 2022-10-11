import { TripPaths } from '@fixtures/travel/types';

export type Action =
  | {
      payload: { railTripPolylines: TripPaths[] };
      type: 'set-rail-trip-polylines';
    }
  | { payload: { imgId: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  railTripPolylines?: TripPaths[];
  shared: {
    imgId?: string;
  };
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
