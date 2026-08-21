/** @type {import('next').NextConfig} */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { withBotId } = require('botid/next/config');

const lastModified = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  hour: 'numeric',
  hour12: false,
  minute: 'numeric',
  month: 'numeric',
  timeZone: 'Africa/Johannesburg',
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

// Enforcing. Rationale for every non-obvious source is in docs/decisions.md
// D-260814c; the promotion from Report-Only is D-260815h.
const contentSecurityPolicyDirectives = {
  'base-uri': ["'self'"],
  // mapsresources-pa is the Maps SDK's style-table host, observed in production
  // reports on /travel rather than assumed. The narrowness that hid it is real:
  // img-src carries https://*.googleapis.com while this lists hosts one by one.
  'connect-src': [
    "'self'",
    'blob:',
    'data:',
    'https://maps.googleapis.com',
    'https://mapsresources-pa.googleapis.com',
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
  // 'wasm-unsafe-eval' permits the WebAssembly module Maps compiles and nothing
  // else; 'unsafe-eval' would be a far wider grant than the violation calls for.
  'script-src': [
    "'self'",
    "'wasm-unsafe-eval'",
    'https://maps.googleapis.com',
    'https://va.vercel-scripts.com',
  ],
  // fonts.googleapis.com and fonts.gstatic.com survive the 2026-08-14 font
  // vendoring because the Maps SDK requests them for its own controls, which
  // production reports confirmed. See docs/security.md.
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
    key: 'Content-Security-Policy',
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
  // Every capability below is disabled entirely (empty allowlist), including
  // for this origin itself. Nothing under src/ or the Maps SDK it loads calls
  // any of these — the map is a fixed set of fixture markers/polylines, not a
  // live position, so geolocation is unneeded rather than merely unused. See
  // docs/security.md.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
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

// The 42 Apple splash images: iOS fetches at most one of them directly at
// launch, outside any fetch the service worker could intercept, so they have
// no business filling the offline precache — see docs/pwa-seo.md and the
// splash-matrix item in docs/roadmap.md.
const SPLASH_IMAGE = /^apple-splash-\d+-\d+\.png$/;

// @serwist/next's own public-directory scan (`globPublicPatterns`, default
// `['**/*']`) takes only positive include patterns — there is no exclude
// option for it, and the underlying `glob` package dropped `!`-prefixed
// pattern negation in v6. Supplying `additionalPrecacheEntries` ourselves is
// the only way to narrow what it precaches from `public/`; doing so skips
// its scan entirely, so this has to reproduce it in full, minus the splash
// images, rather than layer on top of it.
const publicDir = path.join(__dirname, 'public');

const getPublicPrecacheEntries = () =>
  fs
    .readdirSync(publicDir, { recursive: true, withFileTypes: true })
    .filter(
      entry =>
        entry.isFile() &&
        // `glob` ignores dotfiles by default (no `dot: true` here), which
        // `readdirSync` does not — without this, a local `.DS_Store` ends up
        // precached on a build run straight from a Finder-browsed checkout.
        !entry.name.startsWith('.') &&
        // Mirrors @serwist/next's own hardcoded ignores for its build output.
        !/^sw\.js(\.map)?$/.test(entry.name) &&
        !entry.name.startsWith('swe-worker-') &&
        !SPLASH_IMAGE.test(entry.name)
    )
    .map(entry => {
      const absolutePath = path.join(entry.parentPath, entry.name);
      const relativePath = path
        .relative(publicDir, absolutePath)
        .split(path.sep)
        .join('/');
      const revision = crypto
        .createHash('md5')
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- `absolutePath` is always a real path this same readdirSync just returned, never external input
        .update(fs.readFileSync(absolutePath))
        .digest('hex');

      return { revision, url: `/${relativePath}` };
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
// webpack config out of dev entirely. See docs/decisions.md D-260807a.
module.exports = async () => {
  if (process.env.NODE_ENV !== 'production') {
    return withBundleAnalyzer(baseConfig);
  }

  const { default: withSerwistInit } = await import('@serwist/next');
  const withSerwist = withSerwistInit({
    additionalPrecacheEntries: getPublicPrecacheEntries(),
    swDest: 'public/sw.js',
    swSrc: 'service-worker/index.ts',
  });

  return withBundleAnalyzer(withSerwist(baseConfig));
};
