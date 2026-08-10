import { useRailTrips } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { act, renderHook, waitFor } from '@utils/test/render';
import type { FC, PropsWithChildren } from 'react';

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <PortfolioStateProvider>{children}</PortfolioStateProvider>
);

describe('useRailTrips', () => {
  it('starts empty and fetches rail trips on mount', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        trips: [{ path: 'encoded-trip-1', trip: 'Trip A' }],
        upcomingTrips: [],
      }),
      ok: true,
    });

    const { result } = renderHook(() => useRailTrips(), { wrapper });

    expect(result.current).toEqual({
      railTripPolylines: [],
      settled: false,
    });

    await waitFor(() => expect(result.current.settled).toBe(true));

    expect(result.current.railTripPolylines[0].tripPaths).toEqual([
      ['encoded-trip-1'],
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rail-trips',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('includes a separate group for upcoming trips when present', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        trips: [{ path: 'past-trip', trip: 'Trip A' }],
        upcomingTrips: [{ path: 'future-trip', trip: 'Trip B' }],
      }),
      ok: true,
    });

    const { result } = renderHook(() => useRailTrips(), { wrapper });

    await waitFor(() =>
      expect(result.current.railTripPolylines).toHaveLength(2)
    );

    expect(result.current.railTripPolylines[0].tripPaths).toEqual([
      ['past-trip'],
    ]);
    expect(result.current.railTripPolylines[1].tripPaths).toEqual([
      ['future-trip'],
    ]);
  });

  it('does not fetch again once rail trips are cached', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        trips: [{ path: 'encoded-trip-1', trip: 'Trip A' }],
        upcomingTrips: [],
      }),
      ok: true,
    });

    const { rerender, result } = renderHook(() => useRailTrips(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.settled).toBe(true));

    rerender();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('settles with no rail layers when all fetch attempts fail', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useRailTrips(), { wrapper });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(result.current).toEqual({
      railTripPolylines: [],
      settled: true,
    });
    expect(console.error).toHaveBeenCalledWith(
      'Unable to load rail-trip map data'
    );

    jest.useRealTimers();
  });
});
