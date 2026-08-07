import { useViewportSize } from '@mantine/hooks';
import { useEffect } from 'react';
import { Map } from '@components/travel/Map';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import {
  MockInfoWindow,
  MockMap,
  installGoogleMapsMock,
  resetGoogleMapsMock,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { FC } from 'react';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useViewportSize: jest.fn(),
}));

installGoogleMapsMock();

const DispatchAllLoaded: FC = () => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({
      payload: { markersLoaded: true },
      type: 'set-markers-loaded',
    });
    dispatch({
      payload: { railPolylinesLoaded: true },
      type: 'set-rail-polylines-loaded',
    });
    dispatch({
      payload: { tripPolylinesLoaded: true },
      type: 'set-trip-polylines-loaded',
    });
  }, [dispatch]);

  return null;
};

const ChildProbe: FC<{
  infoWindow?: google.maps.InfoWindow;
  map?: google.maps.Map;
}> = ({ infoWindow, map }) => (
  <div>
    childHasMap: {String(!!map)}, childHasInfoWindow: {String(!!infoWindow)}
  </div>
);

describe('Map', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
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
    render(
      <PortfolioStateProvider>
        <Map />
      </PortfolioStateProvider>
    );

    expect(MockMap.instances).toHaveLength(1);
    expect(MockInfoWindow.instances).toHaveLength(1);
  });

  it('uses the desktop minZoom/zoom for a wide viewport', () => {
    (useViewportSize as jest.Mock).mockReturnValue({
      height: 800,
      width: 1024,
    });

    render(
      <PortfolioStateProvider>
        <Map />
      </PortfolioStateProvider>
    );

    const [map] = MockMap.instances;

    expect(map.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ minZoom: 2, zoom: 2 })
    );
  });

  it('uses the mobile minZoom/zoom for a narrow viewport', () => {
    (useViewportSize as jest.Mock).mockReturnValue({ height: 800, width: 500 });

    render(
      <PortfolioStateProvider>
        <Map />
      </PortfolioStateProvider>
    );

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

    const { rerender } = render(
      <PortfolioStateProvider>
        <Map />
      </PortfolioStateProvider>
    );

    const [map] = MockMap.instances;

    map.setOptions.mockClear();
    (useViewportSize as jest.Mock).mockReturnValue({ height: 800, width: 500 });
    rerender(
      <PortfolioStateProvider>
        <Map />
      </PortfolioStateProvider>
    );

    expect(map.setOptions).toHaveBeenCalledTimes(1);

    const [{ 0: resizeOptions }] = map.setOptions.mock.calls;

    expect(resizeOptions.minZoom).toBe(1);
    expect(resizeOptions).not.toHaveProperty('zoom');
  });

  it('pans to Auckland once everything has loaded', () => {
    render(
      <PortfolioStateProvider>
        <Map />
        <DispatchAllLoaded />
      </PortfolioStateProvider>
    );

    const [map] = MockMap.instances;

    expect(map.panTo).toHaveBeenCalledWith({
      lat: -36.847639,
      lng: 174.762473,
    });
  });

  it('steps the zoom up one level at a time once loaded, then re-enables scroll zoom at the target', async () => {
    render(
      <PortfolioStateProvider>
        <Map />
        <DispatchAllLoaded />
      </PortfolioStateProvider>
    );

    const [map] = MockMap.instances;

    // desktop viewport sets the initial zoom to 2 on mount, so the
    // post-load reveal climbs 2 -> 3 -> 4 before reaching the target of 5,
    // pausing 80ms between each step (see zoomMap in Map.tsx)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(80);
    });
    expect(map.setZoom).toHaveBeenNthCalledWith(1, 3);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(80);
    });
    expect(map.setZoom).toHaveBeenNthCalledWith(2, 4);

    expect(map.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ scrollwheel: true })
    );
  });

  it('clones children with the map and info window once both exist', () => {
    const { getByText } = render(
      <PortfolioStateProvider>
        <Map>
          <ChildProbe />
        </Map>
      </PortfolioStateProvider>
    );

    expect(
      getByText('childHasMap: true, childHasInfoWindow: true')
    ).toBeInTheDocument();
  });
});
