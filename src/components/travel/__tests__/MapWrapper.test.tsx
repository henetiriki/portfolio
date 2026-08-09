import { MapWrapper } from '@components/travel/MapWrapper';
import { cities } from '@fixtures/travel';
import { useRailTrips } from '@hooks';
import { act, render, screen } from '@utils/test/render';
import type { ComponentProps, PropsWithChildren } from 'react';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useRailTrips: jest.fn(),
}));
jest.mock('@googlemaps/react-wrapper', () => ({
  ...jest.requireActual('@googlemaps/react-wrapper'),
  Wrapper: ({ children }: PropsWithChildren) => <>{children}</>,
}));
jest.mock('../index', () => ({
  Map: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Marker: (props: ComponentProps<'div'> & Record<string, unknown>) => (
    <div
      data-endmarker={String(!!props.endMarker)}
      data-idx={props.idx as number}
      data-testid='marker'
    />
  ),
  Polyline: (props: ComponentProps<'div'> & Record<string, unknown>) => (
    <div
      data-endrailtrippolyline={String(!!props.endRailTripPolyline)}
      data-endtrippolyline={String(!!props.endTripPolyline)}
      data-idx={props.idx as number}
      data-testid='polyline'
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
    (useRailTrips as jest.Mock).mockReturnValue([]);
  });

  it('always renders exactly one marker per city, even before the map has intersected', () => {
    render(<MapWrapper />);

    expect(screen.getAllByTestId('marker')).toHaveLength(cities.length);
  });

  it('renders no polylines and no extra markers before the sentinel intersects', () => {
    render(<MapWrapper />);

    expect(screen.queryAllByTestId('polyline')).toHaveLength(0);
  });

  it('drops additional markers and polylines once the sentinel intersects', () => {
    render(<MapWrapper />);
    triggerIntersection(true);

    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(
      cities.length
    );
    expect(screen.getAllByTestId('polyline').length).toBeGreaterThan(0);
  });

  it('keeps the deferred map layers mounted after the first intersection', () => {
    render(<MapWrapper />);
    triggerIntersection(true);
    triggerIntersection(false);

    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(
      cities.length
    );
    expect(screen.getAllByTestId('polyline').length).toBeGreaterThan(0);
  });

  it('flags exactly one marker as the end marker once dropped', () => {
    render(<MapWrapper />);
    triggerIntersection(true);

    const endMarkers = screen
      .getAllByTestId('marker')
      .filter(marker => marker.getAttribute('data-endmarker') === 'true');

    expect(endMarkers).toHaveLength(1);
  });

  it('never passes idx=0 to a marker (regression test for the staggering fix)', () => {
    render(<MapWrapper />);
    triggerIntersection(true);

    const idxValues = screen
      .getAllByTestId('marker')
      .map(marker => marker.getAttribute('data-idx'));

    expect(idxValues).not.toContain('0');
  });

  it('flags exactly one polyline as the end trip polyline once dropped', () => {
    render(<MapWrapper />);
    triggerIntersection(true);

    const endTripPolylines = screen
      .getAllByTestId('polyline')
      .filter(
        polyline => polyline.getAttribute('data-endtrippolyline') === 'true'
      );

    expect(endTripPolylines).toHaveLength(1);
  });

  it('flags exactly one polyline as the end rail trip polyline when rail trips exist', () => {
    (useRailTrips as jest.Mock).mockReturnValue([
      { polylineOpts: {}, tripPaths: [['a'], ['b']] },
    ]);

    render(<MapWrapper />);
    triggerIntersection(true);

    const endRailPolylines = screen
      .getAllByTestId('polyline')
      .filter(
        polyline => polyline.getAttribute('data-endrailtrippolyline') === 'true'
      );

    expect(endRailPolylines).toHaveLength(1);
  });
});
