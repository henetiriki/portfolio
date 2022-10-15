import type { CSS } from '@nextui-org/react';

export const formContainer: CSS = {
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    mw: '100%',
  },
  '@md': {
    mw: '80%',
  },
  '@lg': {
    mw: '60%',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const topRow: CSS = {
  d: 'flex',
  fd: 'column',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@sm': {
    fd: 'row',
    gap: '$lg',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const formInput: CSS = {
  mb: '$2xl',
  mt: '$md',
  width: '100%',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@sm': {
    mw: '50%',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const formTextArea: CSS = {
  mb: '$2xl',
  mt: '$md',
  width: '100%',
};

export const submitButton: CSS = {
  mt: '$md',
  px: '$13',
  w: '100%',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@xs': {
    w: 'auto',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};
