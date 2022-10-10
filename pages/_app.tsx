import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { MutableRefObject, useRef } from 'react';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { Transition } from '@components/content';
import { Navigation } from '@components/nav';
import { Layout } from '@containers/layout';
import { useLoading } from '@hooks';
import { PortfolioStateProvider } from '@state/context';
import { globalStyles, theme } from '@styles/shared';
import { fullTitle } from '@utils/head';
import '@styles/shared/Toastify.css';

const FsBackground = dynamic(
  () => import('@components/content').then(mod => mod.FsBackground),
  {
    ssr: false,
  }
);

const Portfolio: NextPage<AppProps> = ({
  Component,
  pageProps,
}): JSX.Element => {
  const pageTopRef = useRef() as MutableRefObject<HTMLDivElement>;
  const isLoading = useLoading();

  globalStyles();

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Portfolio')}</title>
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <meta
          content='On-line Portfolio and CV for Louw Swart - Front-end Developer based in Wellington, New Zealand'
          key='pageDescription'
          name='description'
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
              {isLoading && <Transition />}
              <FsBackground pageTopRef={pageTopRef} />
              <Navigation pageTopRef={pageTopRef} />
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
