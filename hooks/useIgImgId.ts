import { NextRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { ImageId } from './types';

const fetcher = async (url: string): Promise<ImageId> => {
  const response = await fetch(url);

  if (response.ok) {
    return response.json();
  }

  return Promise.reject(response.text());
};

export const useIgImgId = (router: NextRouter): string | undefined => {
  const routeRef = useRef<string>();
  const [igImgId, setIgImgId] = useState<string | undefined>();

  const track = (path: string) => {
    if (path === routeRef.current) {
      return;
    }

    // ensure the image will be cleared on route change
    // which triggers the shimmer on re-draw
    setIgImgId(undefined);
    fetchImageId().then();
    routeRef.current = path;
  };

  const fetchImageId = async () => {
    const { id } = await fetcher('/api/img-id');

    if (id) {
      setIgImgId(id);
    }
  };

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
