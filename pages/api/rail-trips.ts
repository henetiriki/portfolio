import { NextApiRequest, NextApiResponse } from 'next';
import { railTrips } from '@fixtures/travel';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(railTrips);
};

export default handler;
