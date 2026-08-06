import { useDeepCompareEffectForMaps } from '@hooks';
import { renderHook } from '@utils/test/render';

class MockLatLng {
  lat: number;
  lng: number;

  constructor(litOrLat: { lat: number; lng: number } | number, lng?: number) {
    if (typeof litOrLat === 'object') {
      this.lat = litOrLat.lat;
      this.lng = litOrLat.lng;
    } else {
      this.lat = litOrLat;
      this.lng = lng as number;
    }
  }

  equals(other: MockLatLng | undefined): boolean {
    return other != null && this.lat === other.lat && this.lng === other.lng;
  }
}

beforeAll(() => {
  (global as { google?: unknown }).google = {
    maps: { LatLng: MockLatLng },
  };
});

describe('useDeepCompareEffectForMaps', () => {
  it('runs the effect on mount', () => {
    const callback = jest.fn();

    renderHook(() => useDeepCompareEffectForMaps(callback, [{ a: 1 }]));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not re-run when a plain-object dependency is deep-equal across renders', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffectForMaps(callback, deps),
      { initialProps: { deps: [{ a: 1 }] } }
    );

    rerender({ deps: [{ a: 1 }] });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('re-runs when a plain-object dependency deeply changes', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffectForMaps(callback, deps),
      { initialProps: { deps: [{ a: 1 }] } }
    );

    rerender({ deps: [{ a: 2 }] });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not re-run when a LatLngLiteral dependency has equal lat/lng across renders', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffectForMaps(callback, deps),
      { initialProps: { deps: [{ lat: 1, lng: 2 }] } }
    );

    rerender({ deps: [{ lat: 1, lng: 2 }] });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('re-runs when a LatLngLiteral dependency changes', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffectForMaps(callback, deps),
      { initialProps: { deps: [{ lat: 1, lng: 2 }] } }
    );

    rerender({ deps: [{ lat: 3, lng: 4 }] });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
