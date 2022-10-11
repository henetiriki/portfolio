import { TripPaths } from '@fixtures/travel/types';

export type Action =
  {
      payload: { markersLoaded: boolean };
      type: 'set-markers-loaded';
    } | {
      payload: { railPolylinesLoaded: boolean };
      type: 'set-rail-polylines-loaded';
    } | {
      payload: { railTripPolylines: TripPaths[] };
      type: 'set-rail-trip-polylines';
    } | {
      payload: { tripPolylinesLoaded: boolean };
      type: 'set-trip-polylines-loaded';
    } | { payload: { imgId: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  shared: {
    imgId?: string;
  };
  travel: {
    markersLoaded?: boolean;
    railPolylinesLoaded?: boolean;
    railTripPolylines?: TripPaths[];
    tripPolylinesLoaded?: boolean;
  };
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
