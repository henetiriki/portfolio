import type { Sx } from '@mantine/core';

export const formContainer: Sx = {
  /* eslint-disable sort-keys/sort-keys-fix */
  '@media (max-width: 650px)': {
    maxWidth: '100%',
  },
  '@media (max-width: 1280px)': {
    maxWidth: '80%',
  },
  '@media (max-width: 1400px)': {
    maxWidth: '60%',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const topRow: Sx = {
  display: 'flex',
  flexDirection: 'column',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@media (max-width: 960px)': {
    flexDirection: 'row',
    gap: '1.25rem',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const formInput: Sx = {
  marginBottom: '3rem',
  marginTop: '1rem',
  width: '100%',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@media (max-width: 960px)': {
    maxWidth: '50%',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const formTextArea: Sx = {
  marginBottom: '3rem',
  marginTop: '1rem',
  width: '100%',
};

export const submitButton: Sx = {
  marginTop: '1rem',
  paddingLeft: '2.25rem',
  paddingRight: '2.25rem',
  width: '100%',
  /* eslint-disable sort-keys/sort-keys-fix */
  '@media (max-width: 650px)': {
    width: 'auto',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};
