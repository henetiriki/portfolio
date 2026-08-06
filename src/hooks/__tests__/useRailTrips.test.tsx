import { useRailTrips } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { renderHook, waitFor } from '@utils/test/render';
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

    expect(result.current).toEqual([]);

    await waitFor(() => expect(result.current).toHaveLength(1));

    expect(result.current[0].tripPaths).toEqual([['encoded-trip-1']]);
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

    await waitFor(() => expect(result.current).toHaveLength(2));

    expect(result.current[0].tripPaths).toEqual([['past-trip']]);
    expect(result.current[1].tripPaths).toEqual([['future-trip']]);
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

    await waitFor(() => expect(result.current).toHaveLength(1));

    rerender();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
