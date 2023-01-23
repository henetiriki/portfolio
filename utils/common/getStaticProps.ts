import getConfig from 'next/config';
import { randomItem } from '@utils/common/randomItem';
import type { ImageId } from '@utils/common';
import type { GetStaticProps } from 'next';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

export const getStaticProps: GetStaticProps = async () => {
  const imgId = await randomItem(imageIds);
  const data: ImageId = { imgId };

  return {
    props: {
      data,
    },
  };
};
