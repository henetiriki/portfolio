import { useRouter } from 'next/router';
import { useIgImgId } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { act, renderHook, waitFor } from '@utils/test/render';
import type { FC, PropsWithChildren } from 'react';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

type Listener = (asPath: string) => void;

const createRouterEvents = () => {
  const listeners = new Map<string, Set<Listener>>();

  return {
    emit: (event: string, asPath: string) => {
      listeners.get(event)?.forEach(listener => listener(asPath));
    },
    off: (event: string, listener: Listener) => {
      listeners.get(event)?.delete(listener);
    },
    on: (event: string, listener: Listener) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)?.add(listener);
    },
  };
};

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <PortfolioStateProvider>{children}</PortfolioStateProvider>
);

describe('useIgImgId', () => {
  it('fetches and returns an image id on mount', async () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/home',
      events,
      isReady: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ imgId: 'abc123' }),
      ok: true,
    });

    const { result } = renderHook(() => useIgImgId(), { wrapper });

    await waitFor(() => expect(result.current).toBe('abc123'));
  });

  it('falls back to the default image id when the fetch fails', async () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/home',
      events,
      isReady: true,
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, text: jest.fn() });

    const { result } = renderHook(() => useIgImgId(), { wrapper });

    await waitFor(() => expect(result.current).toBe('B8S5LnGpGUn'));
  });

  it('clears and refetches the image id when the route actually changes', async () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/home',
      events,
      isReady: true,
    });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ imgId: 'abc123' }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ imgId: 'xyz789' }),
        ok: true,
      });

    const { result } = renderHook(() => useIgImgId(), { wrapper });

    await waitFor(() => expect(result.current).toBe('abc123'));

    act(() => {
      events.emit('routeChangeComplete', '/travel');
    });

    expect(result.current).toBeUndefined();

    await waitFor(() => expect(result.current).toBe('xyz789'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not clear the image id when routeChangeComplete fires for the same path', async () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/home',
      events,
      isReady: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ imgId: 'abc123' }),
      ok: true,
    });

    const { result } = renderHook(() => useIgImgId(), { wrapper });

    await waitFor(() => expect(result.current).toBe('abc123'));

    act(() => {
      events.emit('routeChangeComplete', '/home');
    });

    expect(result.current).toBe('abc123');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not track the route while the router is not ready yet', async () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/home',
      events,
      isReady: false,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ imgId: 'abc123' }),
      ok: true,
    });

    const { result } = renderHook(() => useIgImgId(), { wrapper });

    await waitFor(() => expect(result.current).toBe('abc123'));
  });
});
