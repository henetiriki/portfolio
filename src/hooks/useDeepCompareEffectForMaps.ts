import { isLatLngLiteral } from '@googlemaps/typescript-guards';
import { createCustomEqual } from 'fast-equals';
import { useEffect, useRef } from 'react';
import type { EffectCallback } from 'react';

const deepCompareEqualsForMaps = createCustomEqual(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deepEqual => (a: any, b: any) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return deepEqual(a, b);
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDeepCompareMemoize = (value: any) => {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

export const useDeepCompareEffectForMaps = (
  callback: EffectCallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(callback, dependencies.map(useDeepCompareMemoize));
