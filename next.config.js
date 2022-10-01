/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 31536000,
  },
  publicRuntimeConfig: {
    igImgIds: process.env.ISTAGRAM_IMAGE_IDS,
  },
  reactStrictMode: true,
  rewrites: async () => [
    {
      destination: `${process.env.IMAGE_HOST}/:slug`,
      source: '/ig/:slug',
    },
  ],
  swcMinify: true,
};

module.exports = nextConfig;
