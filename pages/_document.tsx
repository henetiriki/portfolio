import { Html, Head, Main, NextScript } from 'next/document';

const Document = () => (
  <Html>
    <Head>
      <meta charSet='utf-8' />
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      <meta content='Louw Swart' name='author' />
      <meta name='msapplication-TileColor' content='#da532c' />
      <meta
        name='msapplication-config'
        content='/images/manifesticons/browserconfig.xml'
      />
      <meta name='theme-color' content='#ffffff' />
      <link rel='icon' href='/favicon.ico' />
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/images/manifesticons/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/images/manifesticons/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='194x194'
        href='/images/manifesticons/favicon-194x194.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='192x192'
        href='/images/manifesticons/android-chrome-192x192.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/images/manifesticons/favicon-16x16.png'
      />
      <link rel='manifest' href='/site.webmanifest' />
      <link
        rel='mask-icon'
        href='/images/manifesticons/safari-pinned-tab.svg'
        color='#5bbad5'
      />
      <link rel='preconnect' href='https://fonts.gstatic.com' />
      <link
        href='https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
        rel='stylesheet'
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
