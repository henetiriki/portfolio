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
  it('starts as false and flips on routeChangeStart/Complete/Error', () => {
    const events = createRouterEvents();

    (useRouter as jest.Mock).mockReturnValue({ events });

    const { result } = renderHook(() => useLoading());

    expect(result.current).toBe(false);

    act(() => events.emit('routeChangeStart'));
    expect(result.current).toBe(true);

    act(() => events.emit('routeChangeComplete'));
    expect(result.current).toBe(false);

    act(() => events.emit('routeChangeError'));
    expect(result.current).toBe(true);
  });

  it('unsubscribes from all router events on unmount', () => {
    const events = createRouterEvents();
    const offSpy = jest.spyOn(events, 'off');

    (useRouter as jest.Mock).mockReturnValue({ events });

    const { unmount } = renderHook(() => useLoading());

    unmount();

    expect(offSpy).toHaveBeenCalledWith(
      'routeChangeStart',
      expect.any(Function)
    );
    expect(offSpy).toHaveBeenCalledWith(
      'routeChangeComplete',
      expect.any(Function)
    );
    expect(offSpy).toHaveBeenCalledWith(
      'routeChangeError',
      expect.any(Function)
    );
  });
});
