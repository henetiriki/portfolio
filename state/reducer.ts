import { Action, PortfolioState } from '@state/types';

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
    case 'set-markers-loaded':
      const { markersLoaded } = payload;

      return {
        ...state,
        travel: {
          ...travel,
          markersLoaded,
        },
      };
    case 'set-page-top-ref':
      const { pageTopRef } = payload;

      return {
        ...state,
        shared: {
          ...shared,
          pageTopRef,
        },
      };
    case 'set-rail-polylines-loaded':
      const { railPolylinesLoaded } = payload;

      return {
        ...state,
        travel: {
          ...travel,
          railPolylinesLoaded,
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
    case 'set-trip-polylines-loaded':
      const { tripPolylinesLoaded } = payload;

      return {
        ...state,
        travel: {
          ...travel,
          tripPolylinesLoaded,
        },
      };
    case 'reset-markers-polyline-loaded': {
      const { railTripPolylines = [] } = travel;

      return {
        ...state,
        travel: {
          railTripPolylines: [...railTripPolylines],
        },
      };
    }
    case 'set-ig-img-id':
      const { imgId } = payload;
      const { fallbackImgId } = shared;

      return {
        ...state,
        shared: {
          ...shared,
          imgId,
          ...(!fallbackImgId && { fallbackImgId: imgId }),
        },
      };
  }
};
