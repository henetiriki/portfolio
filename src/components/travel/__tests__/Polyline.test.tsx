import { Polyline } from '@components/travel/Polyline';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import {
  MockMap,
  MockPolyline,
  installGoogleMapsMock,
  resetGoogleMapsMock,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { ComponentProps, FC } from 'react';

installGoogleMapsMock();

const PolylinesLoadedProbe: FC = () => {
  const {
    state: {
      travel: { railPolylinesLoaded, tripPolylinesLoaded },
    },
  } = usePortfolioState();

  return (
    <div>
      railPolylinesLoaded: {String(railPolylinesLoaded)}, tripPolylinesLoaded:{' '}
      {String(tripPolylinesLoaded)}
    </div>
  );
};

const renderPolyline = (
  props: Partial<ComponentProps<typeof Polyline>> = {}
) => {
  const map = new MockMap(document.createElement('div'), {});

  const utils = render(
    <PortfolioStateProvider>
      <Polyline
        idx={1}
        map={map as unknown as google.maps.Map}
        order={1}
        strokeColor='#fff'
        {...props}
      />
      <PolylinesLoadedProbe />
    </PortfolioStateProvider>
  );

  return { map, ...utils };
};

describe('Polyline', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds its path from literal legs', () => {
    renderPolyline({
      legs: [
        { lat: 1, lng: 2 },
        { lat: 3, lng: 4 },
      ],
    });

    const [polyline] = MockPolyline.instances;

    expect(polyline.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        path: [expect.any(Object), expect.any(Object)],
        strokeColor: '#fff',
      })
    );
    expect(polyline.setOptions.mock.calls[0][0].path).toHaveLength(2);
  });

  it('builds its path from an encoded path string via geometry.encoding.decodePath', () => {
    renderPolyline({ legs: undefined, paths: ['encoded-path-string'] });

    const [polyline] = MockPolyline.instances;

    expect(polyline.setOptions.mock.calls[0][0].path).toHaveLength(2);
  });

  it('builds an empty path when neither legs nor paths are provided', () => {
    renderPolyline({ legs: undefined, paths: undefined });

    const [polyline] = MockPolyline.instances;

    expect(polyline.setOptions.mock.calls[0][0].path).toEqual([]);
  });

  it('stagger-drops using the default order when none is provided', () => {
    renderPolyline({ idx: 2, order: undefined, paths: ['x'] });

    const [polyline] = MockPolyline.instances;

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(polyline.setMap).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(polyline.setMap).toHaveBeenCalledWith(expect.any(MockMap));
  });

  it('drops onto the map after an idx * order * 100ms stagger', () => {
    renderPolyline({ idx: 2, order: 3, paths: ['x'] });

    const [polyline] = MockPolyline.instances;

    act(() => {
      jest.advanceTimersByTime(599);
    });
    expect(polyline.setMap).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(polyline.setMap).toHaveBeenCalledWith(expect.any(MockMap));
  });

  it('dispatches railPolylinesLoaded once the end rail polyline has dropped', async () => {
    const { findByText } = renderPolyline({
      endRailTripPolyline: true,
      idx: 1,
      order: 1,
      paths: ['x'],
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await findByText(/railPolylinesLoaded: true/)).toBeInTheDocument();
  });

  it('dispatches tripPolylinesLoaded once the end trip polyline has dropped', async () => {
    const { findByText } = renderPolyline({
      endTripPolyline: true,
      idx: 1,
      order: 1,
      paths: ['x'],
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await findByText(/tripPolylinesLoaded: true/)).toBeInTheDocument();
  });

  it('does not dispatch either loaded flag for a non-end polyline', () => {
    const { queryByText } = renderPolyline({ idx: 1, order: 1, paths: ['x'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(queryByText('railPolylinesLoaded: true')).not.toBeInTheDocument();
    expect(queryByText('tripPolylinesLoaded: true')).not.toBeInTheDocument();
  });

  it('rescales the stroke weight in response to zoom changes', () => {
    const { map } = renderPolyline({ idx: 1, order: 1, paths: ['x'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [polyline] = MockPolyline.instances;

    act(() => {
      map.setZoom(10);
    });

    expect(polyline.set).toHaveBeenCalledWith('strokeWeight', 2.5);
  });

  it('skips re-setting the stroke weight when a zoom change does not actually change it', () => {
    const { map } = renderPolyline({ idx: 1, order: 1, paths: ['x'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [polyline] = MockPolyline.instances;

    act(() => {
      map.setZoom(10);
    });
    polyline.set.mockClear();

    act(() => {
      map.setZoom(10);
    });

    expect(polyline.set).not.toHaveBeenCalled();
  });

  it('does not attach or draw the polyline when no map is provided', () => {
    renderPolyline({ idx: 1, map: undefined, order: 1, paths: ['x'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [polyline] = MockPolyline.instances;

    expect(polyline.setMap).not.toHaveBeenCalled();
  });

  it('removes the polyline from the map on unmount', () => {
    const { unmount } = renderPolyline({ idx: 1, order: 1, paths: ['x'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [polyline] = MockPolyline.instances;

    unmount();

    expect(polyline.setMap).toHaveBeenCalledWith(null);
  });
});
