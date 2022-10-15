import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useLoading = (): boolean => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const toggleLoading = () => setIsLoading(loading => !loading);

  useEffect(() => {
    router.events.on('routeChangeStart', toggleLoading);
    router.events.on('routeChangeComplete', toggleLoading);
    router.events.on('routeChangeError', toggleLoading);

    return () => {
      router.events.off('routeChangeStart', toggleLoading);
      router.events.off('routeChangeComplete', toggleLoading);
      router.events.off('routeChangeError', toggleLoading);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading;
};
