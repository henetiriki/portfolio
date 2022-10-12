/** @type {import('next').NextConfig} */
// @ts-check
const runtimeCaching = require('next-pwa/cache');

const withoutPWA = config => config;
const withoutBundleAnalyzer = config => config;

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
    : withoutBundleAnalyzer;

const withPWA =
  process.env.WITH_PWA === 'true'
    ? require('next-pwa')({
        dest: 'public',
        runtimeCaching,
      })
    : withoutPWA;

const nextConfig = withBundleAnalyzer(
  withPWA({
    images: {
      minimumCacheTTL: 31536000,
      remotePatterns: [
        {
          hostname: process.env.IMAGE_HOST_NAME,
          pathname: `/${process.env.IMAGE_HOST_PATH}/*`,
          protocol: process.env.IMAGE_HOST_PROTOCOL,
        },
      ],
    },
    publicRuntimeConfig: {
      googleApiKey: process.env.GOOGLE_MAPS_API_KEY,
      imgHost: process.env.IMAGE_HOST,
    },
    reactStrictMode: true,
    serverRuntimeConfig: {
      igImgIds: process.env.ISTAGRAM_IMAGE_IDS,
    },
    swcMinify: true,
  })
);

module.exports = nextConfig;
