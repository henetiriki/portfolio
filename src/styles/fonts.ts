import { Montserrat, Roboto } from 'next/font/google';

export const bodyFont = Roboto({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const headingFont = Montserrat({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});
