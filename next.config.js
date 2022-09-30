/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        hostname: process.env.HOSTNAME,
        pathname: '/api/ig/*',
        ...(process.env.PORT && { port: process.env.PORT }),
        protocol: process.env.PROTOCOL,
      },
    ],
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    igImgIds: process.env.ISTAGRAM_IMAGE_IDS,
  },
  reactStrictMode: true,
  serverRuntimeConfig: {
    host: process.env.HOST,
    imageHost: process.env.IMAGE_HOST,
  },
  swcMinify: true,
};

module.exports = nextConfig;
