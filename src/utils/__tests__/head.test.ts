import { fullTitle, getSeoMetadata } from '@utils/head';

describe('fullTitle', () => {
  it('appends the site suffix to a title', () => {
    expect(fullTitle('Contact')).toBe('Contact // Louw Swart');
  });

  it('trims surrounding whitespace from the title', () => {
    expect(fullTitle('  Travel  ')).toBe('Travel // Louw Swart');
  });
});

describe('getSeoMetadata', () => {
  it('derives one set of canonical and social metadata from page values', () => {
    expect(
      getSeoMetadata({
        description: 'Get in touch',
        path: '/contact',
        title: 'Contact',
      })
    ).toEqual({
      canonicalUrl: 'http://localhost:3000/contact',
      description: 'Get in touch',
      imageUrl: 'http://localhost:3000/images/og-images/portfolio.png',
      pageTitle: 'Contact // Louw Swart',
    });
  });

  it('accepts an absolute page-specific social image', () => {
    expect(
      getSeoMetadata({
        description: 'Selected work',
        image: 'https://images.example.com/portfolio.png',
        path: '/portfolio',
        title: 'Portfolio',
      }).imageUrl
    ).toBe('https://images.example.com/portfolio.png');
  });

  it('uses the production domain when no build-time site URL is available', () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    delete process.env.NEXT_PUBLIC_SITE_URL;

    try {
      expect(
        getSeoMetadata({
          description: 'Travel history',
          path: '/travel',
          title: 'Travel',
        }).canonicalUrl
      ).toBe('https://www.ouwl.house/travel');
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
    }
  });
});
