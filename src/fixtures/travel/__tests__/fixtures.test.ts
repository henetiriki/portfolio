import {
  aucklandPoint,
  cities,
  currentCityPoint,
  getCurrentCityPoint,
} from '@fixtures/travel/cities';
import * as stationFixtures from '@fixtures/travel/stations';
import type { City } from '@fixtures/travel/types';

describe('travel fixtures', () => {
  it('derives the current position from the single current city', () => {
    expect(getCurrentCityPoint(cities)).toBe(currentCityPoint);
    expect(cities).toContainEqual(
      expect.objectContaining({ position: aucklandPoint })
    );
  });

  it.each([
    ['no current cities', []],
    [
      'multiple current cities',
      [
        { current: true, position: { lat: 1, lng: 2 } },
        { current: true, position: { lat: 3, lng: 4 } },
      ],
    ],
  ])('rejects %s', (_scenario, cityFixtures) => {
    expect(() => getCurrentCityPoint(cityFixtures as City[])).toThrow(
      'Travel fixtures must contain exactly one current city'
    );
  });

  it('includes every named station export in the aggregate station list', () => {
    const { stations, ...namedStations } = stationFixtures;
    const stationExports = Object.values(namedStations);

    expect(stations).toHaveLength(stationExports.length);
    expect(stations).toEqual(expect.arrayContaining(stationExports));
  });
});
