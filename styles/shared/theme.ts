import { createTheme } from '@nextui-org/react';

export const colors = {
  /* eslint-disable sort-keys/sort-keys-fix */
  white: '#ffffff',
  primary: '#ffffff',
  whisper: '#eee',
  silver: '#c1c1c1',
  matterhorn: '#4f4f4f',
  gunmetal: '#333739',
  paynesGrey: '#3b3d53',
  valhalla: '#252740',
  blackRussian: '#080a20',
  pumpkin: '#ff7917',
  corn: '#f5eb67',
  pineGreen: '#00786d',
  mediumSeaGreen: '#2ecc71',
  shamrock: '#27e278',
  viking: '#45a8c5',
  allPorts: '#2C6B7E',
  alizarin: '#e22734',
  torchRed: '#fa233E',
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const theme = createTheme({
  theme: {
    colors,
    fonts: {
      sans: 'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
      sansHeading:
        'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    },
  },
  type: 'dark',
});
