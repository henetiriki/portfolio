import { CSS } from '@nextui-org/react';

const footerCommon: CSS = {
  backgroundRepeat: 'repeat',
  backgroundSize: 'contain',
  height: '65px',
  minWidth: '100vw',
  zIndex: 1,
};

export const footerBackground: CSS = {
  backgroundColor: '$black-russian',
};

export const footerWaveUpper: CSS = {
  backgroundImage: 'url(/images/footer/wave-upper.png)',
  backgroundPosition: 'bottom center',
  ...footerCommon,
};

export const footerWaveLower: CSS = {
  backgroundImage: 'url(/images/footer/wave-lower.png)',
  backgroundPosition: 'top center',
  height: '65px',
  ...footerBackground,
  ...footerCommon,
};

export const footerSmBgRepeatSize: CSS = {
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export const footerSmBgPositionHeight: CSS = {
  backgroundPosition: 'top left',
  height: '100px',
};

export const footerMenuItems: CSS = {
  alignItems: 'center',
  columnGap: '$md',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  padding: '$lg 0',
  rowGap: '$md',
};
