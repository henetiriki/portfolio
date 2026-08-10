import type { TripPaths } from '@fixtures/travel/types';
import type { RefObject } from 'react';

export type Action =
  | {
      payload: { pageTopRef: RefObject<HTMLDivElement | null> };
      type: 'set-page-top-ref';
    }
  | {
      payload: { railTripPolylines: TripPaths[] };
      type: 'set-rail-trip-polylines';
    }
  | { payload: { imgId: string | undefined }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  shared: {
    imgId?: string;
    pageTopRef?: RefObject<HTMLDivElement | null> | undefined;
  };
  travel: {
    railTripPolylines?: TripPaths[];
  };
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
