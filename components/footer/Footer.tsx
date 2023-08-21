import { Anchor, Box, Text } from '@mantine/core';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Copyright } from '@components/footer';
import { Logo, WaveWrapper } from '@components/shared';
import { socialLinks } from '@fixtures/footer';
import buildTimeConfig from '@fixtures/generated/build-time-config.json';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import {
  footerBackground,
  footerContainer,
  footerContainerBottom,
  footerLastUpdated,
  footerLines,
  footerLinks,
  footerLinksContainer,
  footerLowerBackground,
  footerSocialLinks,
} from '@styles/footer';
import type { SocialLink } from '@fixtures/types';
import type { FC, JSX } from 'react';

export const Footer: FC = (): JSX.Element => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { pathname } = useRouter();
  const { scrollToTop } = useScrollTo(pageTopRef);
  const { lastModified } = buildTimeConfig;

  return (
    <footer>
      <WaveWrapper sx={{ height: '5rem' }} wave='footer-top' />
      <WaveWrapper wave='footer-bottom' />
      <Box sx={footerBackground}>
        <Box sx={footerContainer}>
          <Box>
            <Logo />
          </Box>
          <Box mt='xl' sx={footerLines} />
          <Box sx={footerLinksContainer}>
            {menuItems.map(({ href, text }) => (
              <Anchor
                component={NextLink}
                href={href}
                key={href}
                onClick={scrollToTop}
                sx={{
                  ...footerLinks,
                  fontWeight: pathname === href ? 'bold' : 'normal',
                }}>
                {text}
              </Anchor>
            ))}
          </Box>
          <Box mb='xl' sx={footerLines} />
          <Box pb='0' sx={footerLinksContainer}>
            {socialLinks.map(({ icon, title, url }: SocialLink) => (
              <Anchor
                href={url}
                key={url}
                rel='noopener noreferrer'
                sx={footerSocialLinks}
                target='_blank'
                title={title}>
                {icon}
              </Anchor>
            ))}
          </Box>
        </Box>
      </Box>
      <Box sx={footerLowerBackground}>
        <Box sx={footerContainerBottom}>
          <Box sx={{ paddingTop: '0.5rem' }}>
            <Copyright />
          </Box>
          <Text sx={footerLastUpdated}>Updated: {lastModified}</Text>
        </Box>
      </Box>
    </footer>
  );
};
