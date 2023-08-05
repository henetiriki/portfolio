import styled from '@emotion/styled';
import { Anchor, Container, Text } from '@mantine/core';
import dynamic from 'next/dynamic';
import Image from 'next/legacy/image';
import NextLink from 'next/link';
import { Copyright } from '@components/footer';
import { Logo } from '@components/shared';
import { socialLinks } from '@fixtures/footer';
import buildTimeConfig from '@fixtures/generated/build-time-config.json';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';

import type { SocialLink } from '@fixtures/types';
import type { FC, JSX } from 'react';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

const FooterLines = styled.div``;

export const Footer: FC = (): JSX.Element => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { scrollToTop } = useScrollTo(pageTopRef);
  const { lastModified } = buildTimeConfig;

  return (
    <footer>
      <div>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/footer-top-haikei.svg'
        />
      </div>
      <div>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/footer-bottom-haikei.svg'
        />
      </div>
      <div>
        <Container>
          <Container>
            <Logo />
          </Container>
          <FooterLines />
          <Container>
            {menuItems.map(({ href, text }, idx) => (
              <NextLink href={href} key={idx} onClick={scrollToTop}>
                {text}
              </NextLink>
            ))}
          </Container>
          <FooterLines />
          <Container>
            {socialLinks.map(({ icon, title, url }: SocialLink) => (
              <Anchor
                href={url}
                key={url}
                rel='noopener noreferrer'
                target='_blank'
                title={title}>
                <DynamicFontAwesomeIcon height={20} icon={icon} width={20} />
              </Anchor>
            ))}
          </Container>
        </Container>
      </div>
      <div>
        <Container>
          <Container>
            <Copyright />
          </Container>
          <Text>Updated: {lastModified}</Text>
        </Container>
      </div>
    </footer>
  );
};
