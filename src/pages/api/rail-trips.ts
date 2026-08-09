import { railTrips } from '@fixtures/travel';
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiError = { error: string };

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiError | typeof railTrips>
) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(405).json({ error: 'Method not allowed' });

    return;
  }

  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
  );
  res.status(200).json(railTrips);
};

export default handler;
