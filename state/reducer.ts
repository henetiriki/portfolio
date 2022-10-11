import { Action, PortfolioState } from '@state/types';

export const initialState: PortfolioState = {
  shared: {},
};

export const reducer = (
  state: PortfolioState,
  { payload, type }: Action
): PortfolioState => {
  switch (type) {
    case 'set-ig-img-id':
      const { imgId } = payload;
      const { shared } = state;

      return {
        ...state,
        shared: {
          ...shared,
          imgId,
        },
      };
    case 'set-rail-trip-polylines':
      const { railTripPolylines } = payload;

      return { ...state, railTripPolylines };
  }
};
