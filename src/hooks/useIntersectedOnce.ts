import { useCallback, useRef, useState } from 'react';

type UseIntersectedOnceResult = {
  hasIntersected: boolean;
  ref: (node: HTMLDivElement | null) => void;
};

export const useIntersectedOnce = (
  threshold: number
): UseIntersectedOnceResult => {
  const [hasIntersected, setHasIntersected] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || hasIntersected) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setHasIntersected(true);
            observer.disconnect();
            observerRef.current = null;
          }
        },
        { threshold }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [hasIntersected, threshold]
  );

  return { hasIntersected, ref };
};
