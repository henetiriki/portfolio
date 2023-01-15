import { Container, Link, Row, Text, styled } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import Image from 'next/legacy/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Copyright } from '@components/footer';
import { Logo } from '@components/shared';
import { socialLinks } from '@fixtures/footer';
import buildTimeConfig from '@fixtures/generated/build-time-config.json';
import type { SocialLink } from '@fixtures/types';
import { menuItems } from '@fixtures/nav';
import type { FC } from 'react';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import {
  footerBackground,
  footerContainer,
  footerLastUpdated,
  footerLines,
  footerLinks,
  footerLinksContainer,
  footerLowerBackground,
} from '@styles/footer';
import { waveWrapper } from '@styles/shared';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

const FooterLines = styled('div', footerLines);

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
      <Row css={{ ...waveWrapper, h: '5rem' }}>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/footer-top-haikei.svg'
        />
      </Row>
      <Row css={waveWrapper}>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/footer-bottom-haikei.svg'
        />
      </Row>
      <Row css={footerBackground}>
        <Container as='div' css={footerContainer}>
          <Container>
            <Logo />
          </Container>
          <FooterLines css={{ mt: '$xl' }} />
          <Container css={footerLinksContainer}>
            {menuItems.map(({ href, text }, idx) => (
              <NextLink href={href} key={idx} passHref>
                <Link
                  as='span'
                  css={{
                    ...footerLinks,
                    fontWeight: pathname === href ? 'bold' : 'normal',
                  }}
                  onClick={scrollToTop}>
                  {text}
                </Link>
              </NextLink>
            ))}
          </Container>
          <FooterLines css={{ mb: '$lg' }} />
          <Container css={{ ...footerLinksContainer, pb: 0 }}>
            {socialLinks.map(({ icon, title, url }: SocialLink) => (
              <Link
                css={footerLinks}
                href={url}
                key={url}
                rel='noopener noreferrer'
                target='_blank'
                title={title}>
                <DynamicFontAwesomeIcon height={20} icon={icon} width={20} />
              </Link>
            ))}
          </Container>
        </Container>
      </Row>
      <Row css={footerLowerBackground}>
        <Container
          as='div'
          css={{
            ...footerContainer,
            p: '$md',
          }}>
          <Container css={{ pt: '$xs' }}>
            <Copyright />
          </Container>
          <Text css={footerLastUpdated}>Updated: {lastModified}</Text>
        </Container>
      </Row>
    </footer>
  );
};
