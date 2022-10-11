import { Container, Link, Row, Text } from '@nextui-org/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Copyright } from '@components/footer';
import { Logo } from '@components/shared';
import buildTimeConfig from '@fixtures/generated/build-time-config.json';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import { footerBackground, footerMenuItems } from '@styles/footer';
import { waveWrapper } from '@styles/shared';

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
        <Container
          as='div'
          css={{
            fontFamily: '$sansHeading',
            p: 'calc(3 * $md)',
            ta: 'center',
          }}>
          <Container>
            <Logo />
          </Container>
          <Container css={footerMenuItems}>
            {menuItems.map(({ href, text }, idx) => (
              <NextLink href={href} key={idx} passHref>
                <Link
                  css={{
                    color: '$white',
                    fontWeight: pathname === href ? 'bold' : 'normal',
                  }}
                  onClick={scrollToTop}>
                  {text}
                </Link>
              </NextLink>
            ))}
          </Container>
          <Container css={{ p: '$lg 0' }}>
            <Copyright />
          </Container>
          <Text
            css={{
              color: '$silver',
              fs: '$xs',
              left: '$lg',
              opacity: 0.6,
              position: 'absolute',
            }}>
            Updated: {lastModified}
          </Text>
        </Container>
      </Row>
    </footer>
  );
};
