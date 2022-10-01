/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        hostname: process.env.IMAGE_HOST_NAME,
        pathname: `${process.env.IMAGE_HOST_PATH}/*`,
        protocol: process.env.IMAGE_HOST_PROTOCOL,
      },
    ],
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
