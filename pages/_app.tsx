import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { Navigation } from '@components/nav';
import { Layout } from '@containers/layout';
import { useLoading } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { globalStyles, theme } from '@styles/shared';
import { fullTitle } from '@utils/head';
import '@styles/shared/Toastify.css';

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

const Portfolio: NextPage<AppProps> = ({
  Component,
  pageProps,
}): JSX.Element => {
  const isLoading = useLoading();

  globalStyles();

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Portfolio')}</title>
        <meta content='width=device-width, initial-scale=1' name='viewport' />
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
      </Head>
      <ErrorBoundary>
        <NextThemesProvider
          attribute='class'
          defaultTheme='dark'
          value={{
            dark: theme.className,
          }}>
          <NextUIProvider theme={theme}>
            <PortfolioStateProvider>
              {isLoading && <DynamicTransition />}
              <DynamicFixedBackground />
              <Navigation />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </PortfolioStateProvider>
          </NextUIProvider>
        </NextThemesProvider>
      </ErrorBoundary>
    </>
  );
};

export default Portfolio;
