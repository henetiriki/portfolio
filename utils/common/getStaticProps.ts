import { GetStaticProps } from 'next';
import getConfig from 'next/config';
import { ImageId } from '@utils/common';
import { randomItem } from '@utils/common/randomItem';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

export const getStaticProps: GetStaticProps = async () => {
  const data: ImageId = { imgId: randomItem(imageIds) };

  return {
    props: {
      data,
    },
    revalidate: 60,
  };
};
