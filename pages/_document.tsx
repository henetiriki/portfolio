import { CssBaseline } from '@nextui-org/react';
import _Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

class Document extends _Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await _Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: <>{initialProps.styles}</>,
    };
  }

  render() {
    return (
      <Html lang='en'>
        <Head style={{ border: 0, height: '100%' }}>
          <meta charSet='utf-8' />
          <meta content='IE=edge' httpEquiv='X-UA-Compatible' />
          <meta content='Louw Swart' name='author' />
          <meta content='#da532c' name='msapplication-TileColor' />
          <meta
            content='/images/manifesticons/browserconfig.xml'
            name='msapplication-config'
          />
          <meta content='#ffffff' name='theme-color' />
          <link href='/favicon.ico' rel='icon' />
          <link
            href='/images/manifesticons/apple-touch-icon.png'
            rel='apple-touch-icon'
            sizes='180x180'
          />
          <link
            href='/images/manifesticons/favicon-32x32.png'
            rel='icon'
            sizes='32x32'
            type='image/png'
          />
          <link
            href='/images/manifesticons/favicon-194x194.png'
            rel='icon'
            sizes='194x194'
            type='image/png'
          />
          <link
            href='/images/manifesticons/android-chrome-192x192.png'
            rel='icon'
            sizes='192x192'
            type='image/png'
          />
          <link
            href='/images/manifesticons/favicon-16x16.png'
            rel='icon'
            sizes='16x16'
            type='image/png'
          />
          <link href='/site.webmanifest' rel='manifest' />
          <link
            color='#5bbad5'
            href='/images/manifesticons/safari-pinned-tab.svg'
            rel='mask-icon'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
            rel='stylesheet'
          />
          {CssBaseline.flush()}
        </Head>
        <body
          style={{
            backgroundColor: 'rgba(12, 14, 39, 0.80)',
            border: 0,
            height: '100%',
          }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
