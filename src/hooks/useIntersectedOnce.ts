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
          // The observer's own `threshold` option only governs which ratios
          // trigger a callback — the callback fired on first observation
          // still reports whatever ratio is current, isIntersecting true at
          // any ratio above 0. Checking the ratio itself is what actually
          // enforces the configured threshold.
          if (entry && entry.intersectionRatio >= threshold) {
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
