import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { usePortfolioState } from '@state/context';

export const useIgImgId = (): string | undefined => {
  const router = useRouter();
  const routeRef = useRef<string>();
  const {
    state: { id },
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
    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, []);

  return igImgId;
};
