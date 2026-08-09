import { useRouter } from 'next/router';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { usePortfolioState } from '@state/context';
import { fetcher } from '@utils/common';
import type { ImageId } from '@utils/common';

export const useIgImgId = (): string | undefined => {
  const { asPath, events, isReady } = useRouter();
  const routeRef = useRef<string | undefined>(undefined);
  const {
    dispatch,
    state: {
      shared: { imgId },
    },
  } = usePortfolioState();
  const track = useCallback(
    (path: string) => {
      if (path && !routeRef.current) {
        // initial load - we don't want to reset the imgId
        routeRef.current = path;
      }

      if (path === routeRef.current) {
        return;
      }

      // Clear the shared image on route change so FixedBackground unmounts
      // it immediately and restores the shimmer while the next id loads.
      dispatch({ payload: { imgId: undefined }, type: 'set-ig-img-id' });
      routeRef.current = path;
    },
    [dispatch]
  );

  const onRouteChangeComplete = useCallback(
    (asPath: string) => {
      track(asPath);
    },
    [track]
  );

  useLayoutEffect(() => {
    const fetchNextImgId = async () => {
      try {
        const { imgId } = await fetcher<ImageId>('/api/img-id');

        dispatch({
          payload: {
            imgId,
          },
          type: 'set-ig-img-id',
        });
      } catch {
        dispatch({
          payload: {
            imgId: 'B8S5LnGpGUn',
          },
          type: 'set-ig-img-id',
        });
      }
    };

    if (!imgId) {
      fetchNextImgId();
    }
  }, [dispatch, imgId]);

  useEffect(() => {
    if (isReady) {
      track(asPath);
    }
  }, [asPath, isReady, track]);

  useEffect(() => {
    events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [events, onRouteChangeComplete]);

  return imgId;
};
