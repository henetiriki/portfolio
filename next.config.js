/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    igImgIds: process.env.NEXT_PUBLIC_ISTAGRAM_IMAGE_IDS,
  },
  reactStrictMode: true,
  serverRuntimeConfig: {
    host: process.env.HOST,
    imageHost: process.env.IMAGE_HOST,
  },
  swcMinify: true,
};

module.exports = nextConfig;
