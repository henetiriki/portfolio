import { initialState, reducer } from '@state/reducer';

describe('reducer', () => {
  it('sets markersLoaded under travel', () => {
    const state = reducer(initialState, {
      payload: { markersLoaded: true },
      type: 'set-markers-loaded',
    });

    expect(state.travel.markersLoaded).toBe(true);
  });

  it('sets imgId under shared without touching travel', () => {
    const state = reducer(initialState, {
      payload: { imgId: 'abc123' },
      type: 'set-ig-img-id',
    });

    expect(state.shared.imgId).toBe('abc123');
    expect(state.travel).toEqual(initialState.travel);
  });

  it('resets loaded flags while preserving cached railTripPolylines', () => {
    const withTrips = reducer(initialState, {
      payload: { railTripPolylines: [{ polylineOpts: {}, tripPaths: [] }] },
      type: 'set-rail-trip-polylines',
    });
    const loaded = reducer(withTrips, {
      payload: { markersLoaded: true },
      type: 'set-markers-loaded',
    });

    const reset = reducer(loaded, {
      payload: undefined as never,
      type: 'reset-markers-polyline-loaded',
    });

    expect(reset.travel.markersLoaded).toBeUndefined();
    expect(reset.travel.railTripPolylines).toEqual(
      withTrips.travel.railTripPolylines
    );
  });
});
