import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { ImageId, randomItem } from '@utils/common';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data: ImageId = { imgId: randomItem(imageIds) };

  res.status(200).json(data);
};

export default handler;
