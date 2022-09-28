import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Suspense } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Navigation } from '@components';
import { AppPropsWithLayout, DefaultLayout } from '@containers';
import { theme } from '@styles';
import { fullTitle } from '@utils';

const FsBackground = dynamic(
  () => import('@components').then(mod => mod.FsBackground),
  {
    ssr: false,
  }
);

const Portfolio: NextPage<AppPropsWithLayout> = ({
  Component,
  pageProps,
}): JSX.Element => {
  const getLayout =
    Component.getLayout ?? (page => <DefaultLayout>{page}</DefaultLayout>);

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
        <NextUIProvider theme={theme}>
          <Suspense>
            <FsBackground />
          </Suspense>
          <Navigation />
          {getLayout(<Component {...pageProps} />)}
        </NextUIProvider>
      </ErrorBoundary>
    </>
  );
};

export default Portfolio;
