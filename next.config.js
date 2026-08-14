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

// Only defined when the remote image host is configured, so a missing variable
// drops the source rather than emitting `undefined://undefined`.
const imageHostOrigin =
  process.env.IMAGE_HOST_NAME && process.env.IMAGE_HOST_PROTOCOL
    ? `${process.env.IMAGE_HOST_PROTOCOL}://${process.env.IMAGE_HOST_NAME}`
    : undefined;

// Report-Only for now. Rationale for every non-obvious source, and the
// conditions for promoting this to an enforcing header, are in
// docs/decisions.md D012.
const contentSecurityPolicyDirectives = {
  'base-uri': ["'self'"],
  'connect-src': [
    "'self'",
    'blob:',
    'data:',
    'https://maps.googleapis.com',
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-insights.com',
  ],
  'default-src': ["'self'"],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  // www.google.com is the YouTube embed's own nested frame, observed as a
  // Report-Only violation on /experience rather than assumed.
  'frame-src': [
    'https://www.google.com',
    'https://www.youtube-nocookie.com',
    'https://www.youtube.com',
  ],
  'img-src': [
    "'self'",
    'blob:',
    'data:',
    imageHostOrigin,
    'https://*.ggpht.com',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
  ],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  // `report-to` is deliberately absent — it supersedes `report-uri` in Chrome
  // but needs an absolute endpoint URL, and adding it stopped reports reaching
  // us entirely. See docs/decisions.md D012.
  'report-uri': ['/api/csp-report'],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://maps.googleapis.com',
    'https://va.vercel-scripts.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'worker-src': ["'self'", 'blob:'],
};

const contentSecurityPolicy = Object.entries(contentSecurityPolicyDirectives)
  .map(([directive, sources]) =>
    [directive, ...sources.filter(Boolean)].join(' ')
  )
  .join('; ');

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
    key: 'Content-Security-Policy-Report-Only',
    value: contentSecurityPolicy,
  },
  // X-XSS-Protection is deliberately absent. The header is deprecated, no
  // current browser implements it, and its `1; mode=block` value was itself
  // exploitable in legacy browsers — so removing it is safer than sending it.
  // Content Security Policy above is the modern replacement.
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
  // NEXT_PUBLIC_* names so client code can read them as plain
  // `process.env.NEXT_PUBLIC_*`. Some source names are also used server-side
  // or retained in deployment config. See docs/environment-variables.md.
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: process.env.GOOGLE_MAPS_MAP_ID,
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
    // The only optimised image is FixedBackground's full-viewport photo, which
    // carries `preload` and is the deliberate LCP element — so its encoded size
    // is on the critical path. Measured on a real photograph, WebP at 85 is
    // ~66% smaller than at 100 (35 KB vs 103 KB) with no visible difference on
    // a backdrop image. Next's own default is 75; 85 stays conservative.
    // Keep this list minimal: every allowed value is a separate cache entry.
    qualities: [85],
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
});

// @serwist/next is ESM-only (no CJS build), so it can't be `require()`d from
// this CommonJS config file — a dynamic `import()` inside an async config
// function is Next.js's own documented escape hatch for this.
//
// Gated on NODE_ENV rather than a flag: every production build gets the
// service worker, and development never does. This is not just a preference —
// `withSerwistInit` attaches a `webpack` key unconditionally (its own
// `disable` option is only checked inside that callback), and `next dev` runs
// Turbopack, which @serwist/next does not support. Returning early keeps a
// webpack config out of dev entirely. See docs/decisions.md D004.
module.exports = async () => {
  if (process.env.NODE_ENV !== 'production') {
    return withBundleAnalyzer(baseConfig);
  }

  const { default: withSerwistInit } = await import('@serwist/next');
  const withSerwist = withSerwistInit({
    swDest: 'public/sw.js',
    swSrc: 'service-worker/index.ts',
  });

  return withBundleAnalyzer(withSerwist(baseConfig));
};
