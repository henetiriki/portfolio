import { useCallback, useState } from 'react';
import type { RefCallback } from 'react';

const vowelSoundPattern = /^[aeiou]/i;

// Derives "a"/"an" from a DOM node's rendered text rather than its props, for
// text written outside React's own render (e.g. a typing-animation library)
export const useArticleAgreement = (): [
  'a' | 'an',
  RefCallback<HTMLElement>,
] => {
  const [article, setArticle] = useState<'a' | 'an'>('a');

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (node.textContent) {
        setArticle(vowelSoundPattern.test(node.textContent) ? 'an' : 'a');
      }
    });

    observer.observe(node, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return [article, ref];
};
