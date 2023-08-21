import { rem } from '@mantine/core';
import {
  IconBrandGit,
  IconBrandInstagram,
  IconBrandLinkedin,
} from '@tabler/icons-react';
import type { SocialLink } from '@fixtures/types';

export const socialLinks: SocialLink[] = [
  {
    icon: <IconBrandGit width={rem(20)} />,
    title: 'See examples of my code here',
    url: 'https://github.com/henetiriki',
  },
  {
    icon: <IconBrandLinkedin width={rem(20)} />,
    title: 'See my LinkedIn here',
    url: 'https://nz.linkedin.com/in/louwswart/',
  },
  {
    icon: <IconBrandInstagram width={rem(20)} />,
    title: 'See my Instagram here',
    url: 'https://instagram.com/henetiriki',
  },
];
