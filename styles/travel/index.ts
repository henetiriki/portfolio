import { CSS } from '@nextui-org/react';

export const legendContainer: CSS = {
  /* eslint-disable sort-keys/sort-keys-fix */
  d: 'flex',
  fd: 'column',
  '@xs': {
    fd: 'row',
    jc: 'space-between',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const markerText: CSS = {
  svg: {
    verticalAlign: 'middle',
  },
};

export const travelContainerTop: CSS = {
  /* eslint-disable sort-keys/sort-keys-fix */
  pb: '$2xl',
  '@xs': {
    pt: '$2xl',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const travelContainerBottom: CSS = {
  /* eslint-disable sort-keys/sort-keys-fix */
  pt: '$2xl',
  '@xs': {
    pb: '$2xl',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};
