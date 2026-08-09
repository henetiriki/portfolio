import Head from 'next/head';
import { getSeoMetadata, siteName } from '@utils/head';
import type { SeoMetadataOptions } from '@utils/head';
import type { FC } from 'react';

export const Seo: FC<SeoMetadataOptions> = props => {
  const { canonicalUrl, description, imageUrl, pageTitle } =
    getSeoMetadata(props);

  return (
    <Head>
      <title key='pageTitle'>{pageTitle}</title>
      <link href={canonicalUrl} key='canonical' rel='canonical' />
      <meta content={description} key='pageDescription' name='description' />
      <meta content='summary' key='twitterCard' name='twitter:card' />
      <meta content={canonicalUrl} key='twitterUrl' name='twitter:url' />
      <meta content={pageTitle} key='twitterTitle' name='twitter:title' />
      <meta
        content={description}
        key='twitterDescription'
        name='twitter:description'
      />
      <meta content={imageUrl} key='twitterImage' name='twitter:image' />
      <meta
        content={pageTitle}
        key='twitterImageAlt'
        name='twitter:image:alt'
      />
      <meta content='@henetiriki' key='twitterCreator' name='twitter:creator' />
      <meta content='website' key='ogType' property='og:type' />
      <meta content={pageTitle} key='ogTitle' property='og:title' />
      <meta
        content={description}
        key='ogDescription'
        property='og:description'
      />
      <meta content={siteName} key='ogSiteName' property='og:site_name' />
      <meta content={canonicalUrl} key='ogUrl' property='og:url' />
      <meta content={imageUrl} key='ogImage' property='og:image' />
      <meta content={pageTitle} key='ogImageAlt' property='og:image:alt' />
    </Head>
  );
};
