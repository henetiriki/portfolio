import { MapWrapper } from '@components/travel/MapWrapper';
import { cities } from '@fixtures/travel';
import { useGoogleMaps, useRailTrips } from '@hooks';
import { act, fireEvent, render, screen } from '@utils/test/render';
import type { PropsWithChildren } from 'react';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useGoogleMaps: jest.fn(),
  useRailTrips: jest.fn(),
}));
jest.mock('../index', () => ({
  Map: ({
    children,
    layersRendered,
    onReady,
  }: PropsWithChildren<{
    layersRendered: boolean;
    onReady: () => void;
  }>) => (
    <div data-layers-rendered={String(layersRendered)} data-testid='map'>
      <button data-testid='map-ready' onClick={onReady} type='button' />
      {children}
    </div>
  ),
  MapError: () => <div>Map failed</div>,
  MapLoader: () => <div>Map loading</div>,
  Marker: ({
    idx,
    layerId,
    onRendered,
  }: {
    idx: number;
    layerId: string;
    onRendered: (layerId: string) => void;
  }) => (
    <button
      data-idx={idx}
      data-testid='marker'
      onClick={() => onRendered(layerId)}
      type='button'
    />
  ),
  Polyline: ({
    idx,
    layerId,
    onRendered,
  }: {
    idx: number;
    layerId: string;
    onRendered: (layerId: string) => void;
  }) => (
    <button
      data-idx={idx}
      data-testid='polyline'
      onClick={() => onRendered(layerId)}
      type='button'
    />
  ),
}));

let intersectionCallback: IntersectionObserverCallback | undefined;

const triggerIntersection = (isIntersecting: boolean) => {
  act(() => {
    intersectionCallback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  });
};

const reportMapReady = () => {
  fireEvent.click(screen.getByTestId('map-ready'));
};

const startLayers = () => {
  triggerIntersection(true);
  reportMapReady();
};

const getLayers = () => [
  ...screen.getAllByTestId('marker'),
  ...screen.getAllByTestId('polyline'),
];

describe('MapWrapper', () => {
  beforeEach(() => {
    intersectionCallback = undefined;
    global.IntersectionObserver = jest.fn(callback => {
      intersectionCallback = callback;

      return {
        disconnect: jest.fn(),
        observe: jest.fn(),
      };
    }) as unknown as typeof IntersectionObserver;
    (useGoogleMaps as jest.Mock).mockReturnValue('success');
    (useRailTrips as jest.Mock).mockReturnValue({
      railTripPolylines: [],
      settled: true,
    });
  });

  it('shows the loader without observing a map that does not exist yet', () => {
    (useGoogleMaps as jest.Mock).mockReturnValue('loading');

    render(<MapWrapper />);

    expect(screen.getByText('Map loading')).toBeInTheDocument();
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('shows the map error without observing or rendering map content', () => {
    (useGoogleMaps as jest.Mock).mockReturnValue('failure');

    render(<MapWrapper />);

    expect(screen.getByText('Map failed')).toBeInTheDocument();
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('waits for base-map readiness after the map becomes visible', () => {
    render(<MapWrapper />);

    triggerIntersection(true);
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);

    reportMapReady();

    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(
      cities.length
    );
    expect(screen.getAllByTestId('polyline').length).toBeGreaterThan(0);
  });

  it('waits for viewport visibility after the base map becomes ready', () => {
    render(<MapWrapper />);

    reportMapReady();
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);

    triggerIntersection(true);

    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(
      cities.length
    );
    expect(screen.getAllByTestId('polyline').length).toBeGreaterThan(0);
  });

  it('keeps the map layers mounted after the first intersection', () => {
    render(<MapWrapper />);
    startLayers();
    triggerIntersection(false);

    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(
      cities.length
    );
    expect(screen.getAllByTestId('polyline').length).toBeGreaterThan(0);
  });

  it('never passes idx=0 to a marker', () => {
    render(<MapWrapper />);
    startLayers();

    const idxValues = screen
      .getAllByTestId('marker')
      .map(marker => marker.getAttribute('data-idx'));

    expect(idxValues).not.toContain('0');
  });

  it('reports completion only after every expected layer reports rendering', () => {
    render(<MapWrapper />);
    startLayers();

    const map = screen.getByTestId('map');
    const layers = getLayers();

    layers.slice(0, -1).forEach(layer => fireEvent.click(layer));
    fireEvent.click(layers[0]);

    expect(map).toHaveAttribute('data-layers-rendered', 'false');

    fireEvent.click(layers.at(-1)!);

    expect(map).toHaveAttribute('data-layers-rendered', 'true');
  });

  it('includes asynchronously supplied rail lines in completion tracking', () => {
    (useRailTrips as jest.Mock).mockReturnValue({
      railTripPolylines: [{ polylineOpts: {}, tripPaths: [['a'], ['b']] }],
      settled: true,
    });

    render(<MapWrapper />);
    startLayers();

    const map = screen.getByTestId('map');
    const layers = getLayers();

    layers.slice(0, -1).forEach(layer => fireEvent.click(layer));
    expect(map).toHaveAttribute('data-layers-rendered', 'false');

    fireEvent.click(layers.at(-1)!);
    expect(map).toHaveAttribute('data-layers-rendered', 'true');
  });

  it('does not finish before the rail-trip request has settled', () => {
    (useRailTrips as jest.Mock).mockReturnValue({
      railTripPolylines: [],
      settled: false,
    });

    const { rerender } = render(<MapWrapper />);

    startLayers();
    getLayers().forEach(layer => fireEvent.click(layer));

    expect(screen.getByTestId('map')).toHaveAttribute(
      'data-layers-rendered',
      'false'
    );

    (useRailTrips as jest.Mock).mockReturnValue({
      railTripPolylines: [],
      settled: true,
    });
    rerender(<MapWrapper />);

    expect(screen.getByTestId('map')).toHaveAttribute(
      'data-layers-rendered',
      'true'
    );
  });
});
