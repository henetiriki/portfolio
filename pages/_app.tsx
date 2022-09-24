import { Container, Grid, NextUIProvider } from '@nextui-org/react';
import Head from 'next/head';
import Image from 'next/image';
import { Footer, Navigation } from '@components';
import { theme } from '@styles';
import { fullTitle } from '@utils';
import type { AppProps } from 'next/app';

const Portfolio = ({ Component, pageProps }: AppProps): JSX.Element => (
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
      <Container
        css={{
          minHeight: '100vh',
          minWidth: '100vw',
          overflow: 'hidden',
          position: 'fixed',
          zIndex: -1,
        }}>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          quality={100}
          src='/images/temp-insta.jpg'
        />
      </Container>
      <Navigation />
      <Grid.Container css={{ minHeight: '100vh' }}>
        <Grid
          css={{ minHeight: '80vh', paddingBottom: 'calc(3 * $xl)' }}
          xs={12}>
          <Component {...pageProps} />
        </Grid>
        <Grid xs={12}>
          <Footer />
        </Grid>
      </Grid.Container>
    </NextUIProvider>
  </>
);

export default Portfolio;
