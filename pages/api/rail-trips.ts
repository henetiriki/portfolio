import { railTrips } from '@fixtures/travel';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(railTrips);
};

export default handler;
