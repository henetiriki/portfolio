import { useIntersectedOnce } from '@hooks';
import { act, renderHook } from '@utils/test/render';

describe('useIntersectedOnce', () => {
  let intersectionCallback: IntersectionObserverCallback | undefined;
  let disconnect: jest.Mock;
  let observe: jest.Mock;

  beforeEach(() => {
    intersectionCallback = undefined;
    disconnect = jest.fn();
    observe = jest.fn();
    global.IntersectionObserver = jest.fn(callback => {
      intersectionCallback = callback;

      return { disconnect, observe } as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
  });

  const triggerIntersection = (intersectionRatio: number) => {
    act(() => {
      intersectionCallback?.(
        [
          {
            intersectionRatio,
            isIntersecting: intersectionRatio > 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
  };

  it('starts without having intersected', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));

    expect(result.current.hasIntersected).toBe(false);
  });

  it('observes the node passed to ref with the given threshold', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    expect(observe).toHaveBeenCalledWith(node);
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.8 }
    );
  });

  it('sets hasIntersected and disconnects once the ratio reaches the threshold', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });
    triggerIntersection(0.8);

    expect(result.current.hasIntersected).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it('does not set hasIntersected for a non-intersecting entry', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });
    triggerIntersection(0);

    expect(result.current.hasIntersected).toBe(false);
  });

  it('does not set hasIntersected while isIntersecting is true but the ratio is below the threshold (regression test: the observer delivers its first callback at whatever ratio is current, not only at the configured threshold)', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });
    triggerIntersection(0.1);

    expect(result.current.hasIntersected).toBe(false);
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('disconnects a previous observer when ref is called again', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    disconnect.mockClear();

    act(() => {
      result.current.ref(null);
    });

    expect(disconnect).toHaveBeenCalled();
  });

  it('does not create a new observer once already intersected', () => {
    const { result } = renderHook(() => useIntersectedOnce(0.8));

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    triggerIntersection(0.8);
    (global.IntersectionObserver as jest.Mock).mockClear();

    act(() => {
      result.current.ref(document.createElement('div'));
    });

    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });
});
