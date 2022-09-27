/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
        pathname: '/insta/*',
        protocol: 'http',
      },
      {
        hostname: 'portfolio.ouq77.kiwi',
        pathname: '/insta/*',
        protocol: 'https',
      },
    ],
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    host: process.env.NEXT_PUBLIC_HOST,
    instaImgIds: process.env.NEXT_PUBLIC_ISTAGRAM_IMAGE_IDS,
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
