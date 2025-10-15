import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '.yarn/',
      '.next/',
      'next.config.js',
      'public/fallback-*.js',
      'public/sw.js',
      'public/workbox-*.js',
    ],
  },
]);
