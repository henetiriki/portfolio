import type { RefObject } from 'react';

export const useScrollTo = (
  ref: RefObject<HTMLDivElement | null> | undefined
): { scrollToTop: () => void } => {
  const scrollToTop = () => {
    ref?.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return { scrollToTop };
};
