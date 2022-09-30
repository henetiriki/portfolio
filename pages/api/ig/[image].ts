import getConfig from 'next/config';
import type { NextApiRequest, NextApiResponse } from 'next';

const { serverRuntimeConfig } = getConfig();

const imageRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { image } = req.query;

  const imageResponse: Response = await fetch(
    `${serverRuntimeConfig.imageHost}/${image}`,
    {
      headers: {
        referer: `${serverRuntimeConfig.host}/ouq77.kiwi`,
      },
    }
  );

  const { ok, status } = imageResponse;

  if (ok) {
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    res.setHeader('Content-Type', imageBlob.type);

    res.status(status).send(Buffer.from(imageBuffer));
  } else {
    res.status(status).send(await imageResponse.text());
  }
};

export default imageRequest;
