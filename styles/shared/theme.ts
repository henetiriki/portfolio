import { createTheme } from '@nextui-org/react';

export const theme = createTheme({
  theme: {
    colors: {
      /* eslint-disable sort-keys/sort-keys-fix */
      white: '#fff',
      primary: '#fff',
      whisper: '#eee',
      silver: '#c1c1c1',
      gray: '#888',
      'dim-gray': '#666',
      matterhorn: '#4f4f4f',
      cinder: '#292b2c',
      valhalla: '#252740',
      'midnight-express': '#121833',
      'black-russian-light': '#101227',
      'black-russian': '#080a20',
      salem: '#19914D',
      shamrock: '#27e278',
      'flame-red': '#911922',
      alizarin: '#e22734',
      /* eslint-enable sort-keys/sort-keys-fix */
    },
    fonts: {
      sans: 'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
      sansHeading:
        'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    },
  },
  type: 'dark',
});
