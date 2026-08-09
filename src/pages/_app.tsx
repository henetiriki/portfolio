import { Box, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { BotIdClient } from 'botid/client';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Navigation } from '@components/nav';
import { ErrorBoundary } from '@components/shared';
import { Layout } from '@containers/layout';
import { useLoading } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { theme } from '@styles';
import { bodyFont, headingFont } from '@styles/fonts';
import '@styles/global.css';
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

const protectedRoutes = [
  {
    method: 'POST',
    path: '/api/contact',
  },
];

const Portfolio: NextPage<AppProps> = ({
  Component, // eslint-disable-line react/prop-types
  pageProps, // eslint-disable-line react/prop-types
}): JSX.Element => {
  const isLoading = useLoading();

  return (
    <>
      <Head>
        <style>{`
          :root {
            --portfolio-font-body: ${bodyFont.style.fontFamily};
            --portfolio-font-heading: ${headingFont.style.fontFamily};
          }
        `}</style>
        <BotIdClient protect={protectedRoutes} />
        <meta content='width=device-width, initial-scale=1' name='viewport' />
      </Head>
      <ErrorBoundary>
        <MantineProvider forceColorScheme='dark' theme={theme}>
          <Box bd={0} bg='rgba(12, 14, 39, 0.8)' h='100%'>
            <PortfolioStateProvider>
              {isLoading && <DynamicTransition />}
              <DynamicFixedBackground />
              <Navigation />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </PortfolioStateProvider>
          </Box>
          <Notifications position='bottom-center' />
        </MantineProvider>
      </ErrorBoundary>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default Portfolio;
