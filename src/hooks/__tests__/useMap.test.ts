import { Status } from '@googlemaps/react-wrapper';
import { Fragment } from 'react';
import { MapError } from '@components/travel/MapError';
import { MapLoader } from '@components/travel/MapLoader';
import { useMap } from '@hooks';
import { renderHook } from '@utils/test/render';

describe('useMap', () => {
  it('renders MapLoader while loading', () => {
    const { result } = renderHook(() => useMap());

    expect(result.current.render(Status.LOADING).type).toBe(MapLoader);
  });

  it('renders MapError on failure', () => {
    const { result } = renderHook(() => useMap());

    expect(result.current.render(Status.FAILURE).type).toBe(MapError);
  });

  it('renders an empty fragment once the map has loaded successfully', () => {
    const { result } = renderHook(() => useMap());

    expect(result.current.render(Status.SUCCESS).type).toBe(Fragment);
  });
});
