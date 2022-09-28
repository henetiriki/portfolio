import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { img } = req.query;

  const response = await fetch(`${process.env.IMAGE_HOST}/${img}`, {
    headers: {
      referer: `${process.env.NEXT_PUBLIC_HOST}/${process.env.DOMAIN}`,
    },
  });

  if (response.ok) {
    const imageBlob = await response.blob();

    res.setHeader('Content-Type', imageBlob.type);
    imageBlob.arrayBuffer().then(buf => {
      res.send(Buffer.from(buf));
    });

    return;
  }

  res.status(404).send('Image not found');
};
