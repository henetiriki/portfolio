import { NextUIProvider } from '@nextui-org/react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FsBackground, Navigation } from '@components';
import { AppPropsWithLayout, DefaultLayout } from '@containers';
import { theme } from '@styles';
import { fullTitle } from '@utils';

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
      <NextUIProvider theme={theme}>
        <FsBackground />
        <Navigation />
        {getLayout(<Component {...pageProps} />)}
      </NextUIProvider>
    </>
  );
};

export default Portfolio;
