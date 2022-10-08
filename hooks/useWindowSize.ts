import { useEffect, useState } from 'react';
import { WindowSize } from './types';

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    height: undefined,
    width: undefined,
  });

  const handleResize = () =>
    setWindowSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
