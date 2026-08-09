# State Management

There is exactly one piece of shared client state in the app: `PortfolioState`, implemented as a React Context wrapping a `useReducer`. No Redux, Zustand, Jotai, or data-fetching library (React Query/SWR) is used — API calls are done with a tiny `fetcher` wrapper around `fetch` (`@utils/common/fetcher.ts`) inside hooks that manage their own `useState`/`useEffect`. The wrapper applies a per-attempt 30s timeout, clears it in `finally`, retries network and non-OK failures twice with exponential backoff, and always rejects with an `Error`.

## Files

- `src/state/types.ts` — `PortfolioState`, `Action` (discriminated union), `Dispatch`, `ContextValue`
- `src/state/reducer.ts` — `initialState` and the `reducer` switch statement
- `src/state/context.tsx` — `PortfolioStateContext`, the `usePortfolioState()` hook, and `PortfolioStateProvider`

## Shape

```ts
type PortfolioState = {
  shared: {
    imgId?: string;                                  // current fixed-background Instagram image id
    pageTopRef?: RefObject<HTMLDivElement>;           // ref to the very top of the page, for scroll-to-top
  };
  travel: {
    markersLoaded?: boolean;
    railPolylinesLoaded?: boolean;
    railTripPolylines?: TripPaths[];                  // fetched rail-trip paths, cached so they aren't refetched
    tripPolylinesLoaded?: boolean;
  };
};
```

`shared` holds cross-page concerns (background image, scroll anchor); `travel` holds state specific to the `/travel` map (see [Travel Feature](travel-feature.md)).

## Actions

| Type                            | Payload                   | Dispatched from                    | Purpose                                                                                                                                        |
| ------------------------------- | ------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `set-page-top-ref`              | `{ pageTopRef }`          | `FixedBackground` (on mount, once) | Registers the scroll-to-top target used by `Navigation`/`Footer`                                                                               |
| `set-ig-img-id`                 | `{ imgId }`               | `useIgImgId`, `404.tsx`, `500.tsx` | Sets the background photo id                                                                                                                   |
| `set-markers-loaded`            | `{ markersLoaded }`       | `Marker` (travel)                  | Signals all city/location markers have finished animating in                                                                                   |
| `set-rail-polylines-loaded`     | `{ railPolylinesLoaded }` | `Polyline` (travel)                | Signals all rail polylines have finished drawing                                                                                               |
| `set-trip-polylines-loaded`     | `{ tripPolylinesLoaded }` | `Polyline` (travel)                | Signals all flight/cruise polylines have finished drawing                                                                                      |
| `set-rail-trip-polylines`       | `{ railTripPolylines }`   | `useRailTrips`                     | Caches the fetched rail trip paths so `/api/rail-trips` is only called once                                                                    |
| `reset-markers-polyline-loaded` | none                      | travel map on re-mount             | Resets the three `*Loaded` flags while preserving `railTripPolylines` (avoids re-fetching) so the map's pan/zoom "reveal" animation can replay |

## Usage pattern

Any component calls `usePortfolioState()` to get `{ state, dispatch }`. The hook throws if used outside `PortfolioStateProvider` (which wraps the whole app in `_app.tsx`, so in practice this can't happen for any real page component). Consumers destructure only the specific state slice they need, e.g.:

```ts
const {
  state: { shared: { pageTopRef } },
} = usePortfolioState();
```

There's no selector/memoization layer — because the whole tree sits under a single provider, any dispatch re-renders every consumer. Given the app's small size (a handful of consumers) this is a deliberate simplicity trade-off rather than an oversight.
