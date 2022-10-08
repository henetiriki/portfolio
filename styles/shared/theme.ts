import { createTheme } from '@nextui-org/react';

export const white = '#ffffff';
export const paynesGrey = '#3b3d53';
export const gunmetal = '#333739';
export const pumpkin = '#ff7917';
export const corn = '#f5eb67';
export const pineGreen = '#00786d';
export const mediumSeaGreen = '#2ecc71';
export const flameRed = '#911922';
export const alizarin = '#e22734';
export const torchRed = '#fa233E';

export const theme = createTheme({
  theme: {
    colors: {
      /* eslint-disable sort-keys/sort-keys-fix */
      white,
      primary: white,
      whisper: '#eee',
      silver: '#c1c1c1',
      valhalla: '#252740',
      'black-russian': '#080a20',
      shamrock: '#27e278',
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
