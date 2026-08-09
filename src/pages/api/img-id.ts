import { randomItem } from '@utils/common';
import type { ImageId } from '@utils/common';
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiError = { error: string };

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiError | ImageId>
) => {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });

    return;
  }

  const imageIds = (process.env.ISTAGRAM_IMAGE_IDS || '')
    .split(',')
    .map(imageId => imageId.trim())
    .filter(Boolean);
  const imgId = randomItem(imageIds);

  if (!imgId) {
    res.status(503).json({ error: 'Service unavailable' });

    return;
  }

  const data: ImageId = { imgId };

  res.status(200).json(data);
};

export default handler;
