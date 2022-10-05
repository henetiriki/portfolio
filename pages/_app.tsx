import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';
import { Navigation } from '@components';
import { Layout } from '@containers';
import { globalStyles, theme } from '@styles';
import { fullTitle } from '@utils/head';
import '../styles/Toastify.css';

const FsBackground = dynamic(
  () => import('@components').then(mod => mod.FsBackground),
  {
    ssr: false,
  }
);

const Portfolio: NextPage<AppProps> = ({
  Component,
  pageProps,
}): JSX.Element => {
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
            <FsBackground />
            <Navigation />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </NextUIProvider>
        </NextThemesProvider>
      </ErrorBoundary>
    </>
  );
};

export default Portfolio;
