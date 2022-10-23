/** @type {import('next-sitemap').IConfig} */
module.exports = {
  changefreq: 'monthly',
  generateIndexSitemap: false,
  generateRobotsTxt: true,
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
