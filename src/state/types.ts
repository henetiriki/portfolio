import type { TripPaths } from '@fixtures/travel/types';
import type { RefObject } from 'react';

export type Action =
  | {
      payload: { markersLoaded: boolean };
      type: 'set-markers-loaded';
    }
  | {
      payload: { pageTopRef: RefObject<HTMLDivElement | null> };
      type: 'set-page-top-ref';
    }
  | {
      payload: { railPolylinesLoaded: boolean };
      type: 'set-rail-polylines-loaded';
    }
  | {
      payload: { railTripPolylines: TripPaths[] };
      type: 'set-rail-trip-polylines';
    }
  | {
      payload: { tripPolylinesLoaded: boolean };
      type: 'set-trip-polylines-loaded';
    }
  | {
      payload: never;
      type: 'reset-markers-polyline-loaded';
    }
  | { payload: { imgId: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  shared: {
    imgId?: string;
    pageTopRef?: RefObject<HTMLDivElement | null> | undefined;
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
