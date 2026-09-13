import { useCallback, useState } from 'react';
import {
  consonantSoundOverrides,
  vowelSoundOverrides,
} from '@fixtures/articleAgreementExceptions';
import type { RefCallback } from 'react';

const vowelSoundPattern = /^[aeiou]/i;
const leadingWordBoundaryPattern = /[^a-z]/i;

const resolveArticle = (text: string): 'a' | 'an' => {
  const [leadingWord] = text.split(leadingWordBoundaryPattern);
  const lowerLeadingWord = leadingWord.toLowerCase();

  if (consonantSoundOverrides.has(lowerLeadingWord)) {
    return 'a';
  }

  if (vowelSoundOverrides.has(lowerLeadingWord)) {
    return 'an';
  }

  return vowelSoundPattern.test(text) ? 'an' : 'a';
};

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
        setArticle(resolveArticle(node.textContent));
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
