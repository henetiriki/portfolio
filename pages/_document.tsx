import { createGetInitialProps } from '@mantine/next';
import _Document, { Head, Html, Main, NextScript } from 'next/document';

const getInitialProps = createGetInitialProps();

class Document extends _Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html lang='en'>
        <Head style={{ border: 0, height: '100%' }}>
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
          <link
            href='/images/manifest-icons/apple-splash-2048-2732.png'
            media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2732-2048.png'
            media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1668-2388.png'
            media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2388-1668.png'
            media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1536-2048.png'
            media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2048-1536.png'
            media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1668-2224.png'
            media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2224-1668.png'
            media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1620-2160.png'
            media='(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2160-1620.png'
            media='(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1290-2796.png'
            media='(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2796-1290.png'
            media='(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1179-2556.png'
            media='(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2556-1179.png'
            media='(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1284-2778.png'
            media='(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2778-1284.png'
            media='(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1170-2532.png'
            media='(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2532-1170.png'
            media='(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1125-2436.png'
            media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2436-1125.png'
            media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1242-2688.png'
            media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2688-1242.png'
            media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-828-1792.png'
            media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1792-828.png'
            media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1242-2208.png'
            media='(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-2208-1242.png'
            media='(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-750-1334.png'
            media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1334-750.png'
            media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-640-1136.png'
            media='(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
            rel='apple-touch-startup-image'
          />
          <link
            href='/images/manifest-icons/apple-splash-1136-640.png'
            media='(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
            rel='apple-touch-startup-image'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
            rel='stylesheet'
          />
          <script
            async
            src='/scripts/hash-redirect.js'
            type='text/javascript'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
