import getConfig from 'next/config';
import { randomItem } from '@utils/common/randomItem';
import type { ImageId } from '@utils/common';
import type { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
  const { serverRuntimeConfig } = getConfig();
  const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];
  const imgId = await randomItem(imageIds);
  const data: ImageId = { imgId };

  return {
    props: {
      data,
    },
    revalidate: 1,
  };
};
