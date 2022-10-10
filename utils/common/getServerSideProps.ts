import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import { ImageId } from '@utils/common';
import { randomItem } from '@utils/common/randomItem';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

export const getServerSideProps: GetServerSideProps = async () => {
  const data: ImageId = { id: randomItem(imageIds) };

  return {
    props: {
      data,
    },
  };
};
