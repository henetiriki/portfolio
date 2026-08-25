import { useLayerCompletion } from '@hooks';
import { act, renderHook } from '@utils/test/render';

describe('useLayerCompletion', () => {
  it('starts unrendered', () => {
    const { result } = renderHook(() =>
      useLayerCompletion({
        expectedLayerIds: ['a', 'b'],
        layersStarted: true,
        railTripsSettled: true,
      })
    );

    expect(result.current.layersRendered).toBe(false);
  });

  it('reports rendered only once every expected layer has reported', () => {
    const { result } = renderHook(() =>
      useLayerCompletion({
        expectedLayerIds: ['a', 'b'],
        layersStarted: true,
        railTripsSettled: true,
      })
    );

    act(() => {
      result.current.handleLayerRendered('a');
    });
    expect(result.current.layersRendered).toBe(false);

    act(() => {
      result.current.handleLayerRendered('b');
    });
    expect(result.current.layersRendered).toBe(true);
  });

  it('does not report rendered while layers have not started', () => {
    const { result } = renderHook(() =>
      useLayerCompletion({
        expectedLayerIds: ['a'],
        layersStarted: false,
        railTripsSettled: true,
      })
    );

    act(() => {
      result.current.handleLayerRendered('a');
    });

    expect(result.current.layersRendered).toBe(false);
  });

  it('reports rendered once the rail-trip request settles, without re-reporting layers', () => {
    const { rerender, result } = renderHook(
      ({ railTripsSettled }: { railTripsSettled: boolean }) =>
        useLayerCompletion({
          expectedLayerIds: ['a'],
          layersStarted: true,
          railTripsSettled,
        }),
      { initialProps: { railTripsSettled: false } }
    );

    act(() => {
      result.current.handleLayerRendered('a');
    });
    expect(result.current.layersRendered).toBe(false);

    rerender({ railTripsSettled: true });

    expect(result.current.layersRendered).toBe(true);
  });
});
