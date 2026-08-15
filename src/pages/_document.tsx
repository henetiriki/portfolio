import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Head, Html, Main, NextScript } from 'next/document';

import { AppleSplashLinks } from '@components/shared';

const Document = () => (
  <Html lang='en' {...mantineHtmlProps}>
    <Head style={{ border: 0, height: '100%' }}>
      <ColorSchemeScript forceColorScheme='dark' />
      <meta charSet='utf-8' />
      <meta content='IE=edge' httpEquiv='X-UA-Compatible' />
      <meta content='Louw Swart' name='author' />
      <meta content='Louw Swart // Portfolio' name='application-name' />
      <meta content='PWA App' name='Louw Swart' />
      <meta content='yes' name='mobile-web-app-capable' />
      <meta content='#080a20' name='theme-color' />
      <link href='/manifest.json' rel='manifest' />
      <link href='https://mastodon.nz/@henetiriki' rel='me' />
      <link
        href='/images/manifest-icons/favicon-16x16.png'
        rel='icon'
        sizes='16x16'
        type='image/png'
      />
      <link
        href='/images/manifest-icons/favicon-32x32.png'
        rel='icon'
        sizes='32x32'
        type='image/png'
      />
      <link
        href='/images/manifest-icons/favicon-196x196.png'
        rel='icon'
        sizes='196x196'
        type='image/png'
      />
      <link href='/favicon.ico' rel='icon' />
      <link
        href='/images/manifest-icons/apple-icon-180.png'
        rel='apple-touch-icon'
      />
      <meta content='yes' name='apple-mobile-web-app-capable' />
      <AppleSplashLinks />
      <script async src='/scripts/hash-redirect.js' type='text/javascript' />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
