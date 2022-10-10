import { NextRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { usePortfolioState } from '@state/context';

export const useIgImgId = (router: NextRouter): string | undefined => {
  const routeRef = useRef<string>();
  const {
    state: { id },
  } = usePortfolioState();
  const [igImgId, setIgImgId] = useState<string | undefined>();

  const track = (path: string) => {
    if (path === routeRef.current) {
      return;
    }

    // ensure the image will be cleared on route change
    // which triggers the shimmer on re-draw
    setIgImgId(undefined);
    routeRef.current = path;
  };

  useEffect(() => {
    setIgImgId(id);
  }, [id]);

  useEffect(() => {
    const { asPath, isReady } = router;

    if (isReady) {
      track(asPath);
    }
  }, [router]);

  useEffect(() => {
    const onRouteChangeComplete = (asPath: string) => {
      track(asPath);
    };

    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, []);

  return igImgId;
};
