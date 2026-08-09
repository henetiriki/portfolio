import { useRouter } from 'next/router';
import { useLoading } from '@hooks';
import { act, renderHook } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const createRouterEvents = () => {
  const listeners = new Map<string, Set<() => void>>();

  return {
    emit: (event: string) => {
      listeners.get(event)?.forEach(listener => listener());
    },
    off: (event: string, listener: () => void) => {
      listeners.get(event)?.delete(listener);
    },
    on: (event: string, listener: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)?.add(listener);
    },
  };
};

describe('useLoading', () => {
  it('starts idle, starts loading deterministically and stops on completion', () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({ events });

    const { result } = renderHook(() => useLoading());

    expect(result.current).toBe(false);

    act(() => events.emit('routeChangeStart'));
    expect(result.current).toBe(true);

    act(() => events.emit('routeChangeStart'));
    expect(result.current).toBe(true);

    act(() => events.emit('routeChangeComplete'));
    expect(result.current).toBe(false);
  });

  it('always clears loading on a route error', () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({ events });

    const { result } = renderHook(() => useLoading());

    act(() => events.emit('routeChangeError'));
    expect(result.current).toBe(false);

    act(() => events.emit('routeChangeStart'));
    expect(result.current).toBe(true);

    act(() => events.emit('routeChangeError'));
    expect(result.current).toBe(false);

    act(() => events.emit('routeChangeError'));
    expect(result.current).toBe(false);
  });

  it('unsubscribes from all router events on unmount', () => {
    const events = createRouterEvents();
    const offSpy = jest.spyOn(events, 'off');
    const onSpy = jest.spyOn(events, 'on');

    (useRouter as jest.Mock).mockReturnValue({ events });

    const { unmount } = renderHook(() => useLoading());

    const startListener = onSpy.mock.calls.find(
      ([event]) => event === 'routeChangeStart'
    )?.[1];
    const stopListener = onSpy.mock.calls.find(
      ([event]) => event === 'routeChangeComplete'
    )?.[1];

    unmount();

    expect(startListener).toEqual(expect.any(Function));
    expect(stopListener).toEqual(expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('routeChangeError', stopListener);
    expect(offSpy).toHaveBeenCalledWith('routeChangeStart', startListener);
    expect(offSpy).toHaveBeenCalledWith('routeChangeComplete', stopListener);
    expect(offSpy).toHaveBeenCalledWith('routeChangeError', stopListener);
  });
});
