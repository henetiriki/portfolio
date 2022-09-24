import { CSS } from '@nextui-org/react';

const footerBefore: CSS = {
  backgroundPosition: 'top center',
  backgroundSize: 'contain',
  content: '',
  height: '65px',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

const footerCommon: CSS = {
  height: '65px',
  minWidth: '100vw',
  position: 'relative',
};

export const footerWaveUpper: CSS = {
  '&:before': {
    ...footerBefore,
    backgroundImage: 'url(/images/footer/wave-upper.png)',
  },
  ...footerCommon,
};

export const footerWaveLower: CSS = {
  '&:before': {
    ...footerBefore,
    backgroundImage: 'url(/images/footer/wave-lower.png)',
  },
  ...footerCommon,
  backgroundColor: '$black-russian',
};
