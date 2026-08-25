import { MAP_STATIC_SIZE, STATIC_MAP_CENTER } from '@fixtures/travel';
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiError = { error: string };

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
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(405).json({ error: 'Method not allowed' });

    return;
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(upstreamUrl());
  } catch {
    console.error('Static map request failed');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(502).json({ error: 'Static map unavailable' });

    return;
  }

  if (!upstreamResponse.ok) {
    console.error('Static map request failed');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(502).json({ error: 'Static map unavailable' });

    return;
  }

  const image = Buffer.from(await upstreamResponse.arrayBuffer());

  res.setHeader(
    'Content-Type',
    upstreamResponse.headers.get('content-type') ?? 'image/png'
  );
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.status(200).end(image);
};

export default handler;
