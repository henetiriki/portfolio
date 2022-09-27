import getConfig from 'next/config';
import { useMemo, useState } from 'react';
import { randomItem } from '@utils';

const { publicRuntimeConfig } = getConfig();

export const useInstaImgId = (): [string[], () => void] => {
  const imageIds = useMemo<string[]>(
    () => publicRuntimeConfig.instaImgIds?.split(',') || [],
    []
  );

  const [instaImgId, setInstaImgId] = useState<string>(randomItem(imageIds));

  const nextImg = () => {
    setInstaImgId(randomItem(imageIds));
  };

  return [[instaImgId], nextImg];
};
