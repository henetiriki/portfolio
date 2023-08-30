/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const lastModified = new Intl.DateTimeFormat('en-NZ', {
  day: 'numeric',
  hour: 'numeric',
  hour12: false,
  minute: 'numeric',
  month: 'numeric',
  timeZone: 'Pacific/Auckland',
  timeZoneName: 'short',
  year: 'numeric',
}).format(new Date());

const withoutBundleAnalyzer = config => config;
const withoutPWA = config => config;

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
      })
    : withoutPWA;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig = withBundleAnalyzer(
  withPWA({
    async headers() {
      return [
        {
          headers: securityHeaders,
          // Apply these headers to all routes in your application.
          source: '/:path*',
        },
      ];
    },
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
      lastModified,
      siteUrl: process.env.HOST,
    },
    reactStrictMode: true,
    async redirects() {
      return [
        {
          destination: '/',
          permanent: true,
          source: '/docs(/?.*)',
        },
        {
          destination: '/',
          permanent: true,
          source: '/static(/?.*)',
        },
        {
          destination: '/images/manifest-icons/favicon-196x196.png',
          permanent: true,
          source: '/resources/images/icon.png',
        },
        {
          destination: '/images/manifest-icons/favicon-196x196.png',
          permanent: true,
          source: '/assets/images/manifesticons/eightbitme-192.png',
        },
        {
          destination: 'https://meet.google.com',
          has: [
            {
              type: 'host',
              value: 'meet.ouq77.kiwi',
            },
          ],
          source: '/',
        },
      ];
    },
    serverRuntimeConfig: {
      igImgIds: process.env.ISTAGRAM_IMAGE_IDS,
    },
    swcMinify: true,
  })
);

module.exports = nextConfig;
