import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useLoading = (): boolean => {
  const { events } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    events.on('routeChangeStart', startLoading);
    events.on('routeChangeComplete', stopLoading);
    events.on('routeChangeError', stopLoading);

    return () => {
      events.off('routeChangeStart', startLoading);
      events.off('routeChangeComplete', stopLoading);
      events.off('routeChangeError', stopLoading);
    };
  }, [events]);

  return isLoading;
};
