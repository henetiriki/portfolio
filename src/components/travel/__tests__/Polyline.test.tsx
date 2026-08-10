import { useReducedMotion } from '@mantine/hooks';
import { Polyline } from '@components/travel/Polyline';
import {
  MockMap,
  MockPolyline,
  installGoogleMapsMock,
  resetGoogleMapsMock,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { ComponentProps } from 'react';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useReducedMotion: jest.fn(),
}));

installGoogleMapsMock();

const renderPolyline = (
  props: Partial<ComponentProps<typeof Polyline>> = {}
) => {
  const map = new MockMap(document.createElement('div'), {});
  const polylineProps: ComponentProps<typeof Polyline> = {
    idx: 1,
    layerId: 'polyline-1',
    map: map as unknown as google.maps.Map,
    onRendered: jest.fn(),
    order: 1,
    strokeColor: '#fff',
    ...props,
  };

  const utils = render(<Polyline {...polylineProps} />);

  return { map, onRendered: polylineProps.onRendered, ...utils };
};

describe('Polyline', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
    (useReducedMotion as jest.Mock).mockReturnValue(false);
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
    const { onRendered } = renderPolyline({ idx: 2, order: 3, paths: ['x'] });

    const [polyline] = MockPolyline.instances;

    act(() => {
      jest.advanceTimersByTime(599);
    });
    expect(polyline.setMap).not.toHaveBeenCalled();
    expect(onRendered).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(polyline.setMap).toHaveBeenCalledWith(expect.any(MockMap));
    expect(onRendered).toHaveBeenCalledWith('polyline-1');
  });

  it('draws immediately when reduced motion is preferred', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    const { map, onRendered } = renderPolyline({
      idx: 2,
      order: 3,
      paths: ['x'],
    });
    const [polyline] = MockPolyline.instances;

    expect(polyline.setMap).toHaveBeenCalledWith(map);
    expect(onRendered).toHaveBeenCalledWith('polyline-1');
  });

  it('reports rendering only once if its map assignment changes', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    const firstMap = new MockMap(document.createElement('div'), {});
    const secondMap = new MockMap(document.createElement('div'), {});
    const onRendered = jest.fn();
    const { rerender } = render(
      <Polyline
        idx={1}
        layerId='polyline-1'
        map={firstMap as unknown as google.maps.Map}
        onRendered={onRendered}
        paths={['x']}
      />
    );

    rerender(
      <Polyline
        idx={1}
        layerId='polyline-1'
        map={secondMap as unknown as google.maps.Map}
        onRendered={onRendered}
        paths={['x']}
      />
    );

    expect(onRendered).toHaveBeenCalledTimes(1);
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

  it('cancels a pending staggered draw on unmount', () => {
    const { onRendered, unmount } = renderPolyline({
      idx: 2,
      order: 1,
      paths: ['x'],
    });
    const [polyline] = MockPolyline.instances;

    unmount();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(polyline.setMap).toHaveBeenCalledTimes(1);
    expect(polyline.setMap).toHaveBeenCalledWith(null);
    expect(onRendered).not.toHaveBeenCalled();
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
