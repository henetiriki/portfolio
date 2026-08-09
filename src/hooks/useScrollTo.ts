import { useReducedMotion } from '@mantine/hooks';
import type { RefObject } from 'react';

export const useScrollTo = (
  ref: RefObject<HTMLDivElement | null> | undefined
): { scrollToTop: () => void } => {
  const reduceMotion = useReducedMotion();

  const scrollToTop = () => {
    ref?.current?.scrollIntoView?.({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return { scrollToTop };
};
