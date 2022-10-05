import getConfig from 'next/config';
import { useMemo, useState } from 'react';
import { randomItem } from '@utils/common';

const { publicRuntimeConfig } = getConfig();

export const useIgImgId = (): { igImageIds: string[]; nextImg: () => void } => {
  const imageIds = useMemo<string[]>(
    () => publicRuntimeConfig.igImgIds?.split(',') || [],
    []
  );

  const [igImgId, setIgImgId] = useState<string>(randomItem(imageIds));

  const nextImg = () => {
    setIgImgId(randomItem(imageIds));
  };

  return {
    igImageIds: [igImgId],
    nextImg,
  };
};
