import { useEffect, useState } from 'react';
import { loadGoogleMaps } from '@utils/googleMaps';

export type GoogleMapsStatus = 'failure' | 'loading' | 'success';

export const useGoogleMaps = (): GoogleMapsStatus => {
  const [status, setStatus] = useState<GoogleMapsStatus>('loading');

  useEffect(() => {
    let active = true;

    void loadGoogleMaps()
      .then(() => {
        if (active) {
          setStatus('success');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('failure');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return status;
};
