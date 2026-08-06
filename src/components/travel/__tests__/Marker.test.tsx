import { Marker } from '@components/travel/Marker';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import {
  MockInfoWindow,
  MockMap,
  MockMarker,
  installGoogleMapsMock,
  resetGoogleMapsMock,
  triggerMapsEvent,
} from '@utils/test/googleMapsMock';
import { act, render } from '@utils/test/render';
import type { ComponentProps, FC } from 'react';

installGoogleMapsMock();

const icon: google.maps.Symbol = {
  path: 'M0 0',
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

describe('Marker', () => {
  beforeEach(() => {
    resetGoogleMapsMock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('configures the underlying marker with a drop animation and an anchored icon', () => {
    renderMarker();

    const [marker] = MockMarker.instances;

    expect(marker.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        animation: 'DROP',
        icon: expect.objectContaining({ ...icon, anchor: { x: 10, y: 20 } }),
      })
    );
  });

  it('drops onto the map after an idx * order * 100ms stagger', () => {
    renderMarker({ idx: 2, order: 3 });

    const [marker] = MockMarker.instances;

    act(() => {
      jest.advanceTimersByTime(599);
    });
    expect(marker.setMap).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(marker.setMap).toHaveBeenCalledWith(expect.any(MockMap));
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

    const [marker] = MockMarker.instances;

    act(() => {
      triggerMapsEvent(marker, 'click');
    });

    expect(marker.setAnimation).toHaveBeenCalledWith('BOUNCE');
    expect(infoWindow.setHeaderDisabled).toHaveBeenCalledWith(true);
    expect(infoWindow.setContent).toHaveBeenCalledWith(
      expect.stringContaining('A title')
    );
    expect(infoWindow.setContent).toHaveBeenCalledWith(
      expect.stringContaining('A description')
    );
    expect(infoWindow.open).toHaveBeenCalledWith(map, marker);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(marker.setAnimation).toHaveBeenCalledWith(null);
  });

  it('auto-closes the info window 5s after it becomes visible', () => {
    const { infoWindow } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // setup itself triggers a couple of incidental close() calls as the
    // marker's effects settle (see development.md) — only the calls after
    // this point are relevant to the auto-close-on-visible behavior
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

  it('rescales the icon in response to zoom changes', () => {
    const { map } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockMarker.instances;

    marker.setIcon.mockClear();

    act(() => {
      map.setZoom(20);
    });

    expect(marker.setIcon).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 2.25 })
    );
  });

  it('removes the marker from the map on unmount', () => {
    const { unmount } = renderMarker({ idx: 1, order: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const [marker] = MockMarker.instances;

    unmount();

    expect(marker.setMap).toHaveBeenCalledWith(null);
  });
});
