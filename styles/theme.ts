import { createTheme } from '@nextui-org/react';

export const theme = createTheme({
  theme: {
    colors: {
      /* eslint-disable sort-keys/sort-keys-fix */
      white: '#fff',
      primary: '#fff',
      whisper: '#eee',
      gray: '#888',
      dimGray: '#666',
      matterhorn: '#4f4f4f',
      cinder: '#292b2c',
      valhalla: '#252740',
      'midnight-express': '#121833',
      'black-russian-light': '#101227',
      'black-russian': '#080a20',
      'black-russian-alpha': 'rgba(#080a20, 0.80)',
      shamrock: '#27e278',
      /* eslint-enable sort-keys/sort-keys-fix */
    },
    fonts: {
      sans: 'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
      sansAlt:
        'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    },
    space: {},
  },
  type: 'dark',
});
