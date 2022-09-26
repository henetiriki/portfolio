import { useMemo, useState } from 'react';
import { randomItem } from '@utils';

export const useInstaImgId = (): [string[], () => void] => {
  const imageIds = useMemo<string[]>(
    () => process.env.NEXT_PUBLIC_ISTAGRAM_IMAGE_IDS?.split(',') || [],
    []
  );

  const [instaImgId, setInstaImgId] = useState<string>(randomItem(imageIds));

  const nextImg = () => {
    setInstaImgId(randomItem(imageIds));
  };

  return [[instaImgId], nextImg];
};
