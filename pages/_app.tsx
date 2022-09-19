import Head from 'next/head';
import { fullTitle } from '@utils';
import type { AppProps } from 'next/app';

const Portfolio = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Portfolio')}</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          key='pageDescription'
          name='description'
          content='On-line Portfolio and CV for Louw Swart - Front-end Developer based in Wellington, New Zealand'
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default Portfolio;
