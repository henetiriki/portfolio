import { MAP_STATIC_SIZE, STATIC_MAP_CENTER } from '@fixtures/travel';
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiError = { error: string };

const ONE_YEAR_IN_SECONDS = 31536000;
const NO_STORE_CACHE_CONTROL = 'private, no-store';
const STATIC_MAP_CACHE_CONTROL = `public, max-age=${ONE_YEAR_IN_SECONDS}, s-maxage=${ONE_YEAR_IN_SECONDS}, immutable`;

const upstreamUrl = () =>
  `https://maps.googleapis.com/maps/api/staticmap?${new URLSearchParams({
    center: STATIC_MAP_CENTER,
    key: process.env.GOOGLE_MAPS_API_KEY ?? '',
    map_id: process.env.GOOGLE_MAPS_STATIC_MAP_ID ?? '',
    scale: '2',
    size: `${MAP_STATIC_SIZE.width}x${MAP_STATIC_SIZE.height}`,
    zoom: '1',
  }).toString()}`;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiError | Buffer>
) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Cache-Control', NO_STORE_CACHE_CONTROL);
    res.status(405).json({ error: 'Method not allowed' });

    return;
  }

  if (Object.keys(req.query ?? {}).length > 0) {
    res.setHeader('Cache-Control', NO_STORE_CACHE_CONTROL);
    res.status(400).json({ error: 'Query parameters are not allowed' });

    return;
  }

  let contentType: string;
  let image: Buffer;

  try {
    const upstreamResponse = await fetch(upstreamUrl());

    if (!upstreamResponse.ok) {
      throw new Error('Static map request failed');
    }

    contentType = upstreamResponse.headers.get('content-type') ?? 'image/png';
    image = Buffer.from(await upstreamResponse.arrayBuffer());
  } catch {
    console.error('Static map request failed');
    res.setHeader('Cache-Control', NO_STORE_CACHE_CONTROL);
    res.status(502).json({ error: 'Static map unavailable' });

    return;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', STATIC_MAP_CACHE_CONTROL);
  res.status(200).end(image);
};

export default handler;
