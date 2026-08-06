import { initialState, reducer } from '@state/reducer';

describe('reducer', () => {
  it('sets markersLoaded under travel', () => {
    const state = reducer(initialState, {
      payload: { markersLoaded: true },
      type: 'set-markers-loaded',
    });

    expect(state.travel.markersLoaded).toBe(true);
  });

  it('sets pageTopRef under shared', () => {
    const pageTopRef = { current: null };

    const state = reducer(initialState, {
      payload: { pageTopRef },
      type: 'set-page-top-ref',
    });

    expect(state.shared.pageTopRef).toBe(pageTopRef);
  });

  it('sets railPolylinesLoaded under travel', () => {
    const state = reducer(initialState, {
      payload: { railPolylinesLoaded: true },
      type: 'set-rail-polylines-loaded',
    });

    expect(state.travel.railPolylinesLoaded).toBe(true);
  });

  it('caches railTripPolylines under travel', () => {
    const railTripPolylines = [{ polylineOpts: {}, tripPaths: [] }];

    const state = reducer(initialState, {
      payload: { railTripPolylines },
      type: 'set-rail-trip-polylines',
    });

    expect(state.travel.railTripPolylines).toBe(railTripPolylines);
  });

  it('sets tripPolylinesLoaded under travel', () => {
    const state = reducer(initialState, {
      payload: { tripPolylinesLoaded: true },
      type: 'set-trip-polylines-loaded',
    });

    expect(state.travel.tripPolylinesLoaded).toBe(true);
  });

  it('sets imgId under shared without touching travel', () => {
    const state = reducer(initialState, {
      payload: { imgId: 'abc123' },
      type: 'set-ig-img-id',
    });

    expect(state.shared.imgId).toBe('abc123');
    expect(state.travel).toEqual(initialState.travel);
  });

  it('resets loaded flags while preserving cached railTripPolylines and dropping other travel state', () => {
    const railTripPolylines = [{ polylineOpts: {}, tripPaths: [] }];
    const withTrips = reducer(initialState, {
      payload: { railTripPolylines },
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

    expect(reset.travel).toEqual({ railTripPolylines });
    expect(reset.travel.markersLoaded).toBeUndefined();
  });

  it('resets to an empty railTripPolylines array when none were ever cached', () => {
    const reset = reducer(initialState, {
      payload: undefined as never,
      type: 'reset-markers-polyline-loaded',
    });

    expect(reset.travel).toEqual({ railTripPolylines: [] });
  });
});
