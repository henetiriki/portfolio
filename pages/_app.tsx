import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FsBackground, Navigation } from '@components';
import { Layout } from '@containers';
import { theme } from '@styles';
import { fullTitle } from '@utils';
import type { AppProps } from 'next/app';

const Portfolio: NextPage<AppProps> = ({
  Component,
  pageProps,
}): JSX.Element => {
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
      <NextUIProvider theme={theme}>
        <FsBackground />
        <Navigation />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NextUIProvider>
    </>
  );
};

export default Portfolio;
