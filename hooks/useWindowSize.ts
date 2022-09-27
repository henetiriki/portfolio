import { useEffect, useState } from 'react';

export const useWindowSize = (): { height: number; width: number } => {
  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
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
