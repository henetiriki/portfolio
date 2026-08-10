import type { Action, PortfolioState } from '@state/types';

export const initialState: PortfolioState = {
  shared: {},
  travel: {},
};

export const reducer = (
  state: PortfolioState,
  { payload, type }: Action
): PortfolioState => {
  const { shared, travel } = state;

  switch (type) {
    case 'set-page-top-ref':
      const { pageTopRef } = payload;

      return {
        ...state,
        shared: {
          ...shared,
          pageTopRef,
        },
      };
    case 'set-rail-trip-polylines':
      const { railTripPolylines } = payload;

      return {
        ...state,
        travel: {
          ...travel,
          railTripPolylines,
        },
      };
    case 'set-ig-img-id':
      const { imgId } = payload;

      return {
        ...state,
        shared: {
          ...shared,
          imgId,
        },
      };
  }
};
