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
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
