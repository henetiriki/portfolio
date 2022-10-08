import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { randomItem } from '@utils/common';

const { serverRuntimeConfig } = getConfig();
const imageIds: string[] = serverRuntimeConfig.igImgIds?.split(',') || [];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ id: randomItem(imageIds) });
};

export default handler;
