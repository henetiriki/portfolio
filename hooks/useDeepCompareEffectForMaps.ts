import { isLatLngLiteral } from '@googlemaps/typescript-guards';
import { createCustomEqual } from 'fast-equals';
import { EffectCallback, useEffect, useRef } from 'react';

const deepCompareEqualsForMaps = createCustomEqual(
  // @ts-ignore
  deepEqual => (a: any, b: any) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    // @ts-ignore
    return deepEqual(a, b);
  }
);

const useDeepCompareMemoize = (value: any) => {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

export const useDeepCompareEffectForMaps = (
  callback: EffectCallback,
  dependencies: any[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(callback, dependencies.map(useDeepCompareMemoize));
