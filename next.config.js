/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const { withBotId } = require('botid/next/config');

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

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
    : withoutBundleAnalyzer;

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

const baseConfig = withBotId({
  // Replaces the old publicRuntimeConfig: next/config's runtime config is
  // deprecated and removed entirely in Next.js 16. These are re-exposed under
  // NEXT_PUBLIC_* names (rather than renaming the underlying env vars, which
  // are also read server-side and configured in Vercel under their current
  // names) so client code can read them as plain `process.env.NEXT_PUBLIC_*`
  // — see docs/environment-variables.md.
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_IMAGE_HOST: process.env.IMAGE_HOST,
    NEXT_PUBLIC_LAST_MODIFIED: lastModified,
    NEXT_PUBLIC_SITE_URL: process.env.HOST,
  },
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
    qualities: [100],
    remotePatterns: [
      {
        hostname: process.env.IMAGE_HOST_NAME,
        pathname: `/${process.env.IMAGE_HOST_PATH}/*`,
        protocol: process.env.IMAGE_HOST_PROTOCOL,
      },
    ],
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
        destination: 'https://meet.google.com/ydp-nsra-gbo',
        has: [
          {
            type: 'host',
            value: 'meet.ouwl.house',
          },
        ],
        permanent: true,
        source: '/',
      },
    ];
  },
  transpilePackages: ['@googlemaps/typescript-guards'],
});

// @serwist/next is ESM-only (no CJS build), so it can't be `require()`d from
// this CommonJS config file — a dynamic `import()` inside an async config
// function is Next.js's own documented escape hatch for this. Only loaded
// when WITH_PWA=true (matching the previous next-pwa gating) so local/preview
// builds don't pay for it.
module.exports = async () => {
  if (process.env.WITH_PWA !== 'true') {
    return withBundleAnalyzer(baseConfig);
  }

  const { default: withSerwistInit } = await import('@serwist/next');
  const withSerwist = withSerwistInit({
    swDest: 'public/sw.js',
    swSrc: 'service-worker/index.ts',
  });

  return withBundleAnalyzer(withSerwist(baseConfig));
};
