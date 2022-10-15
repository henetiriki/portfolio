import type { CSS } from '@nextui-org/react';

export const aboutContainer: CSS = {
  d: 'flex',
  fd: 'column',
  fw: 'nowrap',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    fd: 'row',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const imageContainer: CSS = {
  '& img': {
    borderColor: '$whisper !important',
    borderStyle: 'solid  !important',
    br: '$xs',
    bw: '$xl  !important',
  },
  mt: '$3xl',
  mw: '400px',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    mt: 0,
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};
