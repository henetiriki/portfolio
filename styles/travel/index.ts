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
