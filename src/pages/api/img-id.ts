import { randomItem } from '@utils/common';
import type { ImageId } from '@utils/common';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  const imageIds: string[] = process.env.ISTAGRAM_IMAGE_IDS?.split(',') || [];
  const imgId = await randomItem(imageIds);
  const data: ImageId = { imgId };

  res.status(200).json(data);
};

export default handler;
