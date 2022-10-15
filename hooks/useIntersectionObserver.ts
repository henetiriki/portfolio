import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export const useIntersectionObserver = <T extends HTMLElement>(
  options: IntersectionObserverInit
): [RefObject<T>, boolean] => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  const callbackFunction = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    setIsVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    const refCurrent = ref.current;

    if (refCurrent) {
      observer.observe(refCurrent);
    }

    return () => {
      if (refCurrent) {
        observer.unobserve(refCurrent);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};
