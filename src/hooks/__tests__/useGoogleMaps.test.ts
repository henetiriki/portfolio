import { useGoogleMaps } from '@hooks';
import { loadGoogleMaps } from '@utils/googleMaps';
import { act, renderHook, waitFor } from '@utils/test/render';

jest.mock('../../utils/googleMaps', () => ({
  loadGoogleMaps: jest.fn(),
}));

const mockLoadGoogleMaps = jest.mocked(loadGoogleMaps);

describe('useGoogleMaps', () => {
  beforeEach(() => {
    mockLoadGoogleMaps.mockReset();
  });

  it('reports loading while the Maps API request is pending', () => {
    mockLoadGoogleMaps.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGoogleMaps());

    expect(result.current).toBe('loading');
  });

  it('reports success once the Maps API libraries load', async () => {
    mockLoadGoogleMaps.mockResolvedValue();

    const { result } = renderHook(() => useGoogleMaps());

    await waitFor(() => {
      expect(result.current).toBe('success');
    });
  });

  it('reports failure when the Maps API libraries cannot load', async () => {
    mockLoadGoogleMaps.mockRejectedValue(new Error('Load failed'));

    const { result } = renderHook(() => useGoogleMaps());

    await waitFor(() => {
      expect(result.current).toBe('failure');
    });
  });

  it('does not update success state after unmount', async () => {
    let resolveLoad: (() => void) | undefined;
    const loadPromise = new Promise<void>(resolve => {
      resolveLoad = resolve;
    });

    mockLoadGoogleMaps.mockReturnValue(loadPromise);
    const { unmount } = renderHook(() => useGoogleMaps());

    unmount();
    await act(async () => {
      resolveLoad?.();
      await loadPromise;
    });
  });

  it('does not update failure state after unmount', async () => {
    let rejectLoad: ((error: Error) => void) | undefined;
    const loadPromise = new Promise<void>((_resolve, reject) => {
      rejectLoad = reject;
    });

    mockLoadGoogleMaps.mockReturnValue(loadPromise);
    const { unmount } = renderHook(() => useGoogleMaps());

    unmount();
    await act(async () => {
      rejectLoad?.(new Error('Load failed'));
      await loadPromise.catch(() => undefined);
    });
  });
});
