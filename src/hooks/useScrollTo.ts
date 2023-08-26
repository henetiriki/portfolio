import type { RefObject } from 'react';

export const useScrollTo = (
  ref: RefObject<HTMLDivElement> | undefined
): { scrollToTop: () => void } => {
  const scrollToTop = () => {
    ref?.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return { scrollToTop };
};
