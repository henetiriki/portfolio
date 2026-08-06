import {
  getZoomMarkerWeightExponent,
  getZoomPolylineWeightExponent,
} from '@utils/travel';

describe('getZoomMarkerWeightExponent', () => {
  it.each([
    [undefined, 1],
    [0, 1],
    [10, 1],
    [11, 1.5],
    [16, 1.5],
    [17, 2.25],
    [22, 2.25],
    [23, 1],
  ])('zoom %p resolves to weight %p', (zoom, expected) => {
    expect(getZoomMarkerWeightExponent(zoom)).toBe(expected);
  });
});

describe('getZoomPolylineWeightExponent', () => {
  it.each([
    [undefined, 1],
    [0, 1],
    [4, 1],
    [5, 1.5],
    [8, 1.5],
    [9, 2],
    [12, 2],
    [13, 2.5],
    [16, 2.5],
    [17, 3],
    [20, 3],
    [21, 3.5],
    [24, 3.5],
    [25, 1],
  ])('zoom %p resolves to weight %p', (zoom, expected) => {
    expect(getZoomPolylineWeightExponent(zoom)).toBe(expected);
  });
});
