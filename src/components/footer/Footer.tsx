import { Anchor, Flex, Text } from '@mantine/core';
import { format } from 'date-fns';
import getConfig from 'next/config';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  FooterContainer,
  FooterLines,
  FooterLinksContainer,
} from '@components/footer';
import { Logo, WaveWrapper } from '@components/shared';
import { socialLinks } from '@fixtures/footer';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import { footerLinks, footerSocialLinks } from '@styles/footer';
import type { SocialLink } from '@fixtures/types';
import type { FC, JSX } from 'react';

const {
  publicRuntimeConfig: { lastModified },
} = getConfig();

export const Footer: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { pathname } = useRouter();
  const { scrollToTop } = useScrollTo(pageTopRef);

  return (
    <footer>
      <WaveWrapper sx={{ height: '5rem' }} wave='footer-top' />
      <WaveWrapper wave='footer-bottom' />
      <FooterContainer bg='blackRussian'>
        <Logo />
        <FooterLines mt='xl' />
        <FooterLinksContainer>
          {menuItems.map(({ href, text }) => (
            <Anchor
              c='white'
              component={NextLink}
              fw={pathname === href ? '700' : '400'}
              fz='lg'
              href={href}
              key={href}
              onClick={scrollToTop}
              sx={footerLinks}>
              {text}
            </Anchor>
          ))}
        </FooterLinksContainer>
        <FooterLines mb='xl' />
        <FooterLinksContainer pb='0'>
          {socialLinks.map(({ icon, title, url }: SocialLink) => (
            <Anchor
              c='white'
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
      </FooterContainer>
      <FooterContainer bg='blackRussian.6'>
        <Flex direction='row' justify='center'>
          <Text component='p' m='xs'>
            © 2014 - {format(date, 'yyyy')}{' '}
            <Anchor
              c='shamrock'
              href='https://github.com/henetiriki'
              pl='xs'
              rel='noopener noreferrer'
              target='_blank'>
              @henetiriki
            </Anchor>
          </Text>
        </Flex>
        <Flex align='center' justify='center'>
          <Text c='silver' component='p' fz='xs' m='xs' opacity={0.6}>
            Updated: {lastModified}
          </Text>
        </Flex>
      </FooterContainer>
    </footer>
  );
};
