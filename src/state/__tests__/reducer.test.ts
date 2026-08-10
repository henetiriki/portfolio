import { initialState, reducer } from '@state/reducer';

describe('reducer', () => {
  it('sets pageTopRef under shared', () => {
    const pageTopRef = { current: null };

    const state = reducer(initialState, {
      payload: { pageTopRef },
      type: 'set-page-top-ref',
    });

    expect(state.shared.pageTopRef).toBe(pageTopRef);
  });

  it('caches railTripPolylines under travel', () => {
    const railTripPolylines = [{ polylineOpts: {}, tripPaths: [] }];

    const state = reducer(initialState, {
      payload: { railTripPolylines },
      type: 'set-rail-trip-polylines',
    });

    expect(state.travel.railTripPolylines).toBe(railTripPolylines);
  });

  it('sets imgId under shared without touching travel', () => {
    const state = reducer(initialState, {
      payload: { imgId: 'abc123' },
      type: 'set-ig-img-id',
    });

    expect(state.shared.imgId).toBe('abc123');
    expect(state.travel).toEqual(initialState.travel);
  });
});
