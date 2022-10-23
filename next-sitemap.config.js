/** @type {import('next-sitemap').IConfig} */
// const ContentSecurityPolicy = `
//   default-src 'self';
//   script-src 'self';
//   child-src example.com;
//   style-src 'self' example.com;
//   font-src 'self';
// `;

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
  // {
  //   key: 'Content-Security-Policy',
  //   value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  // },
];

module.exports = {
  changefreq: 'monthly',
  generateIndexSitemap: false,
  generateRobotsTxt: true,
  async headers() {
    return [
      {
        headers: securityHeaders,
        // Apply these headers to all routes in your application.
        source: '/:path*',
      },
    ];
  },
  robotsTxtOptions: {
    policies: [
      {
        disallow: ['/'],
        userAgent: 'Baiduspider',
      },
      {
        disallow: ['/'],
        userAgent: 'baiduspider',
      },
      {
        disallow: ['/'],
        userAgent: 'Baiduspider+',
      },
      {
        disallow: ['/'],
        userAgent: 'Baiduspider-video',
      },
      {
        disallow: ['/'],
        userAgent: 'Baiduspider-image',
      },
      {
        disallow: ['/docs/', '/static/', '/?_escaped_fragment_=/'],
        userAgent: '*',
      },
      {
        allow: '/',
        userAgent: '*',
      },
    ],
  },
  siteUrl: process.env.HOST,
};
