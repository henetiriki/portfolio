const defaultImage = '/images/og-images/portfolio.png';
const productionSiteUrl = 'https://www.ouwl.house';

export const siteName = 'Louw Swart // Portfolio';

export type SeoMetadataOptions = {
  description: string;
  image?: string;
  path: string;
  title: string;
};

export const fullTitle = (title: string) => `${title.trim()} // Louw Swart`;

export const getSeoMetadata = ({
  description,
  image = defaultImage,
  path,
  title,
}: SeoMetadataOptions) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? productionSiteUrl;

  return {
    canonicalUrl: new URL(path, siteUrl).toString(),
    description,
    imageUrl: new URL(image, siteUrl).toString(),
    pageTitle: fullTitle(title),
  };
};
