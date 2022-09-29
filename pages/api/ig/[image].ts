import getConfig from 'next/config';
import type { NextApiRequest, NextApiResponse } from 'next';

const { serverRuntimeConfig } = getConfig();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { image } = req.query;

  const response = await fetch(`${serverRuntimeConfig.imageHost}/${image}`, {
    headers: {
      referer: `${serverRuntimeConfig.host}/ouq77.kiwi`,
    },
  });

  if (response.ok) {
    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    res.setHeader('Content-Type', imageBlob.type);

    res.send(Buffer.from(imageBuffer));

    return;
  } else {
    const whatIsIt = await response.text();

    console.log({ whatIsIt });
  }

  res.status(404).send('Image not found');
};
