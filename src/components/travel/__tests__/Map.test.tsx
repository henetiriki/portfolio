import { useReducedMotion, useViewportSize } from '@mantine/hooks';
import { Map } from '@components/travel/Map';
import { currentCityPoint } from '@fixtures/travel';
import {
  MockInfoWindow,
  MockMap,
  installGoogleMapsMock,
  resetGoogleMapsMock,
  triggerMapsEvent,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { FC, ReactNode } from 'react';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useReducedMotion: jest.fn(),
  useViewportSize: jest.fn(),
}));

installGoogleMapsMock();

const ChildProbe: FC<{
  infoWindow?: google.maps.InfoWindow;
  map?: google.maps.Map;
}> = ({ infoWindow, map }) => (
  <div>
    childHasMap: {String(!!map)}, childHasInfoWindow: {String(!!infoWindow)}
  </div>
);

const renderMap = (
  layersRendered: boolean = false,
  children?: ReactNode,
  onReady: () => void = jest.fn()
) =>
  render(
    <Map layersRendered={layersRendered} onReady={onReady}>
      {children}
    </Map>
  );

describe('Map', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
    (useReducedMotion as jest.Mock).mockReturnValue(false);
    (useViewportSize as jest.Mock).mockReturnValue({
      height: 800,
      width: 1024,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a single map and info window once the container mounts', () => {
    renderMap();

    expect(MockMap.instances).toHaveLength(1);
    expect(MockInfoWindow.instances).toHaveLength(1);
  });

  it('sets the cloud Map ID at construction without embedded styles', () => {
    renderMap();

    const [map] = MockMap.instances;

    expect(map.options).toEqual(
      expect.objectContaining({ mapId: 'test-google-maps-map-id' })
    );
    expect(map.options).not.toHaveProperty('styles');
  });

  it('uses the desktop minZoom/zoom for a wide viewport', () => {
    (useViewportSize as jest.Mock).mockReturnValue({
      height: 800,
      width: 1024,
    });

    renderMap();

    const [map] = MockMap.instances;

    expect(map.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ minZoom: 2, zoom: 2 })
    );
  });

  it('uses the mobile minZoom/zoom for a narrow viewport', () => {
    (useViewportSize as jest.Mock).mockReturnValue({ height: 800, width: 500 });

    renderMap();

    const [map] = MockMap.instances;

    expect(map.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ minZoom: 1, zoom: 1 })
    );
  });

  it('updates minZoom but does not force zoom again on a later resize', () => {
    (useViewportSize as jest.Mock).mockReturnValue({
      height: 800,
      width: 1024,
    });

    const onReady = jest.fn();
    const { rerender } = renderMap(false, undefined, onReady);

    const [map] = MockMap.instances;

    map.setOptions.mockClear();
    (useViewportSize as jest.Mock).mockReturnValue({ height: 800, width: 500 });
    rerender(<Map layersRendered={false} onReady={onReady} />);

    expect(map.setOptions).toHaveBeenCalledTimes(1);

    const [{ 0: resizeOptions }] = map.setOptions.mock.calls;

    expect(resizeOptions.minZoom).toBe(1);
    expect(resizeOptions).not.toHaveProperty('zoom');
  });

  it('reports readiness once after the first visible tiles have loaded', () => {
    const onReady = jest.fn();

    renderMap(false, undefined, onReady);
    const [map] = MockMap.instances;

    expect(onReady).not.toHaveBeenCalled();

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
      triggerMapsEvent(map, 'tilesloaded');
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('hides the static placeholder once tiles have loaded', () => {
    const { container } = renderMap();
    const [map] = MockMap.instances;

    expect(container.querySelector('img')?.className).not.toMatch(
      /placeholderHidden/
    );

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    expect(container.querySelector('img')?.className).toMatch(
      /placeholderHidden/
    );
  });

  it('does not reveal the map until its layers have rendered', async () => {
    renderMap();
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(map.moveCamera).not.toHaveBeenCalled();
  });

  it('smoothly reveals the current city once everything has loaded', async () => {
    renderMap(true);
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });

    expect(map.moveCamera).toHaveBeenCalled();
    const midpoint = map.moveCamera.mock.calls.at(-1)?.[0];

    expect(midpoint?.zoom).toBeGreaterThan(2);
    expect(midpoint?.zoom).toBeLessThan(4);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });

    expect(map.moveCamera).toHaveBeenLastCalledWith({
      center: currentCityPoint,
      zoom: 4,
    });
    expect(map.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ scrollwheel: true })
    );
  });

  it('reveals the loaded map immediately when reduced motion is preferred', async () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    renderMap(true);
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    expect(map.moveCamera).toHaveBeenCalledWith({
      center: currentCityPoint,
      zoom: 4,
    });
    expect(map.setOptions).toHaveBeenCalledWith({ scrollwheel: true });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(map.moveCamera).toHaveBeenCalledTimes(1);
  });

  it('does not reveal a map whose starting camera state is unavailable', async () => {
    const getCenter = jest
      .spyOn(MockMap.prototype, 'getCenter')
      .mockReturnValue(undefined as never);

    renderMap(true);
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(map.moveCamera).not.toHaveBeenCalled();
    getCenter.mockRestore();
  });

  it('cancels a pending reveal on unmount', async () => {
    const { unmount } = renderMap(true);
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    unmount();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(map.moveCamera).not.toHaveBeenCalled();
  });

  it('cancels an in-progress reveal on unmount', async () => {
    const { unmount } = renderMap(true);
    const [map] = MockMap.instances;

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(400);
    });

    const cameraUpdates = map.moveCamera.mock.calls.length;

    expect(cameraUpdates).toBeGreaterThan(0);

    unmount();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(map.moveCamera).toHaveBeenCalledTimes(cameraUpdates);
  });

  it('clones children only after the base map has rendered', () => {
    const { getByText, queryByText } = renderMap(false, <ChildProbe />);
    const [map] = MockMap.instances;

    expect(
      queryByText('childHasMap: true, childHasInfoWindow: true')
    ).not.toBeInTheDocument();

    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    expect(
      getByText('childHasMap: true, childHasInfoWindow: true')
    ).toBeInTheDocument();
  });

  it('removes the initial tile listener on unmount', () => {
    const onReady = jest.fn();
    const { unmount } = renderMap(false, undefined, onReady);
    const [map] = MockMap.instances;

    unmount();
    act(() => {
      triggerMapsEvent(map, 'tilesloaded');
    });

    expect(onReady).not.toHaveBeenCalled();
  });
});
