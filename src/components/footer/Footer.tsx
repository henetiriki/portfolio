import { Anchor, Flex, Space, Text } from '@mantine/core';
import { IconCopyright } from '@tabler/icons-react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FooterContainer, FooterLinksContainer } from '@components/footer';
import { Logo, WaveWrapper } from '@components/shared';
import { socialLinks } from '@fixtures/footer';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import type { SocialLink } from '@fixtures/types';
import type { MantineTheme } from '@mantine/core';
import type { FC, JSX } from 'react';

const lastModified = process.env.NEXT_PUBLIC_LAST_MODIFIED;

export const Footer: FC = (): JSX.Element => {
  const currentYear = useMemo<number>(() => new Date().getFullYear(), []);
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
        <Space mt='xl' />
        <FooterLinksContainer>
          {menuItems.map(({ href, text }) => (
            <Anchor
              c={pathname === href ? 'white' : 'silver.1'}
              component={NextLink}
              fw={pathname === href ? '700' : '400'}
              fz='lg'
              href={href}
              key={href}
              onClick={scrollToTop}
              sx={{
                '&:hover': {
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                },
              }}>
              {text}
            </Anchor>
          ))}
        </FooterLinksContainer>
        <FooterLinksContainer pb='0'>
          {socialLinks.map(({ icon, title, url }: SocialLink) => (
            <Anchor
              c='white'
              href={url}
              key={url}
              rel='noopener noreferrer'
              sx={({ colors: { shamrock } }: MantineTheme) => ({
                '&:hover': {
                  color: shamrock[4],
                },
              })}
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
            <Anchor
              c='shamrock'
              href='https://github.com/henetiriki'
              pr='xs'
              rel='noopener noreferrer'
              target='_blank'>
              @henetiriki
            </Anchor>{' '}
            <IconCopyright size={11} /> 2014 - {currentYear}
          </Text>
        </Flex>
        <Flex align='center' justify='center'>
          <Text c='silver' component='p' fz='sm' m='xs' opacity={0.7}>
            Updated: {lastModified}
          </Text>
        </Flex>
      </FooterContainer>
    </footer>
  );
};
