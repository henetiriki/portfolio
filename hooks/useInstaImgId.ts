import { useEffect, useMemo, useState } from 'react';
import { randomItem } from '@utils';

export const useInstaImgId = (): string[] => {
  const imageIds = useMemo<string[]>(
    () => process.env.NEXT_PUBLIC_ISTAGRAM_IMAGE_IDS?.split(',') || [],
    []
  );

  const [instaImgId, setInstaImgId] = useState<string>(randomItem(imageIds));

  useEffect(() => {
    const imageReplaceTimer = setTimeout(
      () => setInstaImgId(randomItem(imageIds)),
      10000
    );

    return () => {
      clearTimeout(imageReplaceTimer);
    };
  }, [instaImgId]);

  return [instaImgId];
};
