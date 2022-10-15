import getConfig from 'next/config';
import { randomItem } from '@utils/common';
import type { ImageId } from '@utils/common';
import type { NextApiRequest, NextApiResponse } from 'next';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data: ImageId = { imgId: randomItem(imageIds) };

  res.status(200).json(data);
};

export default handler;
