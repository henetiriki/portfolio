import { useRouter } from 'next/router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePortfolioState } from '@state/context';
import { fetcher } from '@utils/common';
import type { ImageId } from '@utils/common';

export const useIgImgId = (): string | undefined => {
  const router = useRouter();
  const routeRef = useRef<string | undefined>(undefined);
  const {
    dispatch,
    state: {
      shared: { imgId },
    },
  } = usePortfolioState();
  const [igImgId, setIgImgId] = useState<string | undefined>();

  const onRouteChangeComplete = (asPath: string) => {
    track(asPath);
  };

  const track = (path: string) => {
    if (path && !routeRef.current) {
      // initial load - we don't want to reset the igImgId
      routeRef.current = path;
    }

    if (path === routeRef.current) {
      return;
    }

    // ensure the image will be cleared on route change
    // which triggers the shimmer on re-draw
    setIgImgId(undefined);
    routeRef.current = path;
  };

  useLayoutEffect(() => {
    if (imgId) {
      setIgImgId(imgId);
    }
  }, [imgId]);

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
      } catch (error: unknown) {
        dispatch({
          payload: {
            imgId: 'B8S5LnGpGUn',
          },
          type: 'set-ig-img-id',
        });
      }
    };

    if (!igImgId) {
      fetchNextImgId();
    }
  }, [dispatch, igImgId]);

  useEffect(() => {
    const { asPath, isReady } = router;

    if (isReady) {
      track(asPath);
    }
  }, [router]);

  useEffect(() => {
    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return igImgId;
};
