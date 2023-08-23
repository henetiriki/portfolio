import { Box, MantineProvider } from '@mantine/core';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Navigation } from '@components/nav';
import { ErrorBoundary } from '@components/shared';
import { Layout } from '@containers/layout';
import { useLoading } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { theme } from '@styles/shared';
import { fullTitle } from '@utils/head';
import type { MantineTheme } from '@mantine/core';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { JSX } from 'react';

const DynamicFixedBackground = dynamic(
  () => import('@components/content').then(mod => mod.FixedBackground),
  {
    ssr: false,
  }
);

const DynamicTransition = dynamic(
  () => import('@components/content').then(mod => mod.Transition),
  {
    ssr: false,
  }
);

const {
  publicRuntimeConfig: { siteUrl },
} = getConfig();

const Portfolio: NextPage<AppProps> = ({
  Component, // eslint-disable-line react/prop-types
  pageProps, // eslint-disable-line react/prop-types
}): JSX.Element => {
  const isLoading = useLoading();

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Portfolio')}</title>
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <link href={siteUrl} key='canonical' rel='canonical' />
        <meta
          content='Online Portfolio and CV for Louw Swart - Front-end Engineer based in Wellington, New Zealand, using Javascript frameworks such as React, Next.js and Node.js'
          key='pageDescription'
          name='description'
        />
        <meta
          content='louw swart portfolio cv javascript ui developer front-end engineer traveller photographer agile javascript node.js next.js open source react'
          key='pageKeywords'
          name='keywords'
        />
        <meta content='summary' name='twitter:card' />
        <meta content='https://portfolio.ouq77.kiwi' name='twitter:url' />
        <meta content='Louw Swart // Portfolio' name='twitter:title' />
        <meta
          content='Online Portfolio and CV for Louw Swart'
          key='twitterDescription'
          name='twitter:description'
        />
        <meta
          content='https://portfolio.ouq77.kiwi/images/og-images/portfolio.png'
          name='twitter:image'
        />
        <meta content='@henetiriki' name='twitter:creator' />
        <meta content='website' property='og:type' />
        <meta content='Louw Swart // Portfolio' property='og:title' />
        <meta
          content='Online Portfolio and CV for Louw Swart'
          key='ogDescription'
          property='og:description'
        />
        <meta content='Louw Swart // Portfolio' property='og:site_name' />
        <meta content='https://portfolio.ouq77.kiwi' property='og:url' />
        <meta
          content='https://portfolio.ouq77.kiwi/images/og-images/portfolio.png'
          property='og:image'
        />
      </Head>
      <ErrorBoundary>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <Box
            sx={({ fn: { rgba } }: MantineTheme) => ({
              backgroundColor: rgba('#0C0E27', 0.8),
              border: 0,
              height: '100%',
            })}>
            <PortfolioStateProvider>
              {isLoading && <DynamicTransition />}
              <DynamicFixedBackground />
              <Navigation />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </PortfolioStateProvider>
          </Box>
        </MantineProvider>
      </ErrorBoundary>
    </>
  );
};

export default Portfolio;
