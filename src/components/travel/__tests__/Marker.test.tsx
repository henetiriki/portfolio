import { useReducedMotion } from '@mantine/hooks';
import { Marker } from '@components/travel/Marker';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import {
  MockAdvancedMarkerElement,
  MockInfoWindow,
  MockMap,
  installGoogleMapsMock,
  resetGoogleMapsMock,
  triggerMapsEvent,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { ComponentProps, FC } from 'react';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useReducedMotion: jest.fn(),
}));

installGoogleMapsMock();

const icon = {
  color: '#ff0000',
  scale: 1,
};

const MarkersLoadedProbe: FC = () => {
  const {
    state: {
      travel: { markersLoaded },
    },
  } = usePortfolioState();

  return <div>markersLoaded: {String(markersLoaded)}</div>;
};

const renderMarker = (props: Partial<ComponentProps<typeof Marker>> = {}) => {
  const map = new MockMap(document.createElement('div'), {});
  const infoWindow = new MockInfoWindow();

  const utils = render(
    <PortfolioStateProvider>
      <Marker
        description='A description'
        icon={icon}
        idx={1}
        infoWindow={infoWindow as unknown as google.maps.InfoWindow}
        map={map as unknown as google.maps.Map}
        order={1}
        position={{ lat: 1, lng: 2 }}
        title='A title'
        {...props}
      />
      <MarkersLoadedProbe />
    </PortfolioStateProvider>
  );

  return { infoWindow, map, ...utils };
};

const clickMarker = (marker: MockAdvancedMarkerElement) => {
  marker.dispatchEvent(new Event('gmp-click'));
};

const getMarkerElements = (marker: MockAdvancedMarkerElement) => ({
  graphic: marker.querySelector('svg') as SVGSVGElement,
  motion: marker.querySelector('svg')?.parentElement as HTMLDivElement,
  path: marker.querySelector('path') as SVGPathElement,
  visual: marker.firstElementChild as HTMLDivElement,
});

describe('Marker', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
    (useReducedMotion as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('configures an accessible advanced marker with DOM-backed icon content', () => {
    renderMarker();

    const [marker] = MockAdvancedMarkerElement.instances;
    const { path, visual } = getMarkerElements(marker);

    expect(marker).toMatchObject({
      anchorLeft: '-41.6667%',
      anchorTop: '-83.3333%',
      gmpClickable: true,
      position: { lat: 1, lng: 2 },
      title: 'A title',
    });
    expect(path).toHaveAttribute('fill', icon.color);
    expect(path).toHaveAttribute('fill-opacity', '0.95');
    expect(visual).toHaveStyle({ transform: 'scale(1)' });
  });

  it('shows immediately without animation when reduced motion is preferred', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    const { infoWindow, map } = renderMarker({ idx: 2, order: 3 });
    const [marker] = MockAdvancedMarkerElement.instances;
    const { graphic, motion } = getMarkerElements(marker);

    expect(marker.map).toBe(map);
    expect(graphic.classList).toHaveLength(1);
    expect(motion.classList).toHaveLength(1);

    act(() => {
      clickMarker(marker);
    });

    expect(graphic.classList).toHaveLength(1);
    expect(infoWindow.open).toHaveBeenCalledWith({
      anchor: marker,
      map,
      shouldFocus: true,
    });
  });

  it('drops onto the map after an idx * order * 100ms stagger', () => {
    const { map } = renderMarker({ idx: 2, order: 3 });
    const [marker] = MockAdvancedMarkerElement.instances;
    const { motion } = getMarkerElements(marker);

    act(() => {
      jest.advanceTimersByTime(599);
    });
    expect(marker.map).toBeUndefined();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(marker.map).toBe(map);
    expect(motion.classList).toHaveLength(2);

    act(() => {
      motion.dispatchEvent(new Event('animationend'));
    });

    expect(motion.classList).toHaveLength(1);
  });

  it('dispatches markersLoaded once the end marker has dropped', async () => {
    const { findByText } = renderMarker({ endMarker: true, idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await findByText('markersLoaded: true')).toBeInTheDocument();
  });

  it('does not dispatch markersLoaded for a non-end marker', () => {
    const { queryByText } = renderMarker({
      endMarker: false,
      idx: 1,
      order: 1,
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(queryByText('markersLoaded: true')).not.toBeInTheDocument();
  });

  it('bounces and opens the info window on click, then stops bouncing after 2s', () => {
    const { infoWindow, map } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;
    const { graphic } = getMarkerElements(marker);

    act(() => {
      clickMarker(marker);
    });

    expect(graphic.classList).toHaveLength(2);
    expect(infoWindow.setHeaderDisabled).toHaveBeenCalledWith(false);

    const [[heading]] = infoWindow.setHeaderContent.mock.calls;
    const [[content]] = infoWindow.setContent.mock.calls;

    expect(heading).toBeInstanceOf(HTMLHeadingElement);
    expect(heading).toHaveTextContent('A title');
    expect(content).toBeInstanceOf(HTMLParagraphElement);
    expect(content).toHaveTextContent('A description');
    expect(infoWindow.setOptions).toHaveBeenCalledWith({
      ariaLabel: 'A title',
    });
    expect(infoWindow.open).toHaveBeenCalledWith({
      anchor: marker,
      map,
      shouldFocus: true,
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(graphic.classList).toHaveLength(1);
  });

  it('restarts the bounce reset timer when clicked again before it elapses', () => {
    renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;
    const { graphic } = getMarkerElements(marker);

    act(() => {
      clickMarker(marker);
      jest.advanceTimersByTime(1000);
      clickMarker(marker);
      jest.advanceTimersByTime(1999);
    });

    expect(graphic.classList).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(graphic.classList).toHaveLength(1);
  });

  it('auto-closes the info window 5s after it becomes visible', () => {
    const { infoWindow } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    infoWindow.close.mockClear();

    act(() => {
      infoWindow.open();
    });

    expect(infoWindow.close).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(infoWindow.close).toHaveBeenCalledTimes(1);
  });

  it('cancels auto-close when the info window is closed manually', () => {
    const { infoWindow } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
      infoWindow.open();
    });

    infoWindow.close.mockClear();

    act(() => {
      infoWindow.close();
      jest.advanceTimersByTime(5000);
    });

    expect(infoWindow.close).toHaveBeenCalledTimes(1);
  });

  it('stagger-drops using the default order when none is provided', () => {
    const { map } = renderMarker({ idx: 2, order: undefined });
    const [marker] = MockAdvancedMarkerElement.instances;

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(marker.map).toBeUndefined();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(marker.map).toBe(map);
  });

  it('does not schedule an auto-close when the info window becomes visible while already closed', () => {
    const { infoWindow } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    infoWindow.close.mockClear();

    act(() => {
      triggerMapsEvent(infoWindow, 'visible');
      jest.advanceTimersByTime(5000);
    });

    expect(infoWindow.close).not.toHaveBeenCalled();
  });

  it('rescales the DOM icon in response to zoom changes', () => {
    const { map } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;
    const { visual } = getMarkerElements(marker);

    act(() => {
      map.setZoom(20);
    });

    expect(visual).toHaveStyle({ transform: 'scale(2.25)' });
  });

  it('keeps the rendered scale unchanged within the same zoom range', () => {
    const { map } = renderMarker({ idx: 1, order: 1 });
    const [marker] = MockAdvancedMarkerElement.instances;
    const { visual } = getMarkerElements(marker);

    expect(visual).toHaveStyle({ transform: 'scale(1)' });

    act(() => {
      map.setZoom(5);
    });

    expect(visual).toHaveStyle({ transform: 'scale(1)' });
  });

  it('does not attach an info-window visibility listener when no info window is provided', () => {
    const { map } = renderMarker({
      idx: 1,
      infoWindow: undefined,
      order: 1,
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;

    expect(marker.map).toBe(map);

    expect(() => {
      act(() => {
        clickMarker(marker);
      });
    }).not.toThrow();
  });

  it('does not attach or drop the marker when no map is provided', () => {
    renderMarker({ idx: 1, map: undefined, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;

    expect(marker.map).toBeUndefined();
  });

  it('cancels a pending staggered drop on unmount', () => {
    const { unmount } = renderMarker({ endMarker: true, idx: 2, order: 1 });
    const [marker] = MockAdvancedMarkerElement.instances;

    unmount();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(marker.map).toBeNull();
  });

  it('cancels the pending bounce reset and removes the animation on unmount', () => {
    const { unmount } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;
    const { graphic } = getMarkerElements(marker);

    act(() => {
      clickMarker(marker);
    });

    expect(graphic.classList).toHaveLength(2);
    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(graphic.classList).toHaveLength(1);
  });

  it('cancels the pending info-window close on unmount', () => {
    const { infoWindow, unmount } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
      infoWindow.open();
    });

    unmount();
    const closeCallsAfterUnmount = infoWindow.close.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(infoWindow.close).toHaveBeenCalledTimes(closeCallsAfterUnmount);
  });

  it('removes the marker from the map on unmount', () => {
    const { unmount } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockAdvancedMarkerElement.instances;

    unmount();

    expect(marker.map).toBeNull();
  });
});
