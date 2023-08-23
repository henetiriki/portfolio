import { Anchor, Box, Flex, Space, Text } from '@mantine/core';
import { format } from 'date-fns';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FooterLinksContainer } from '@components/footer';
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
  footerCopyright,
  footerLastUpdated,
  footerLines,
  footerLinks,
  footerLowerBackground,
  footerSocialLinks,
} from '@styles/footer';
import type { SocialLink } from '@fixtures/types';
import type { FC, JSX } from 'react';

export const Footer: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());
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
          <FooterLinksContainer>
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
          </FooterLinksContainer>
          <Box mb='xl' sx={footerLines} />
          <FooterLinksContainer pb='0'>
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
          </FooterLinksContainer>
        </Box>
      </Box>
      <Box sx={footerLowerBackground}>
        <Box sx={footerContainerBottom}>
          <Flex direction='row' justify='center' pt='0.5rem'>
            <Text>
              © 2014 - {format(date, 'yyyy')}{' '}
              <Anchor
                href='https://github.com/henetiriki'
                rel='noopener noreferrer'
                sx={footerCopyright}
                target='_blank'>
                @henetiriki
              </Anchor>
            </Text>
          </Flex>
          <Space h='xs' />
          <Flex align='center' justify='center'>
            <Text sx={footerLastUpdated}>Updated: {lastModified}</Text>
          </Flex>
        </Box>
      </Box>
    </footer>
  );
};
