import {
  faGithub,
  faInstagram,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { SocialLink } from '@fixtures/types';

export const socialLinks: SocialLink[] = [
  {
    icon: faGithub,
    title: 'See examples of my code here',
    url: 'https://github.com/henetiriki',
  },
  {
    icon: faLinkedin,
    title: 'See my LinkedIn here',
    url: 'https://nz.linkedin.com/in/louwswart/',
  },
  {
    icon: faInstagram,
    title: 'See my Instagram here',
    url: 'https://instagram.com/henetiriki',
  },
];
