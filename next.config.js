const withoutBundleAnalyzer = config => config;

const withBundleAnalyzer =
  process.env.NODE_ENV === 'development' || process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
    : withoutBundleAnalyzer;

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
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
    igImgIds: process.env.ISTAGRAM_IMAGE_IDS,
    imgHost: process.env.IMAGE_HOST,
  },
  reactStrictMode: true,
  swcMinify: true,
});

module.exports = nextConfig;
