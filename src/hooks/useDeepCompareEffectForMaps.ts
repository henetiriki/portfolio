import { isLatLngLiteral } from '@googlemaps/typescript-guards';
import { createCustomEqual } from 'fast-equals';
import { useEffect, useRef } from 'react';
import type { EffectCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isLatLngIsh = (value: any): boolean =>
  isLatLngLiteral(value) || value instanceof google.maps.LatLng;

const compareLatLng = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  b: any
): boolean => new google.maps.LatLng(a).equals(new google.maps.LatLng(b));

// `createInternalComparator` only intercepts *nested* property/element
// comparisons (e.g. a `position` field inside a compared options object) —
// fast-equals calls its plain top-level comparator directly for the two
// values handed to the exported function, never through this hook. So the
// LatLng-aware check is applied twice below: once here for values nested
// inside a compared object, and again by the wrapper that follows for the
// top-level dependency values themselves.
const deepEqualWithLatLngAwareness = createCustomEqual({
  createInternalComparator:
    compare =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, state) =>
      isLatLngIsh(a) || isLatLngIsh(b)
        ? compareLatLng(a, b)
        : compare(a, b, state),
});

const deepCompareEqualsForMaps = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  b: any
): boolean =>
  isLatLngIsh(a) || isLatLngIsh(b)
    ? compareLatLng(a, b)
    : deepEqualWithLatLngAwareness(a, b);

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
