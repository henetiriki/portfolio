import { Container, Link, Row, styled } from '@nextui-org/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Copyright, Logo } from '@components';
import { menuItems } from '@fixtures';
import {
  footerBackground,
  footerMenuItems,
  waveImg,
  waveWrapper,
} from '@styles';

const WaveImg = styled('img', waveImg);

export const Footer: FC = (): JSX.Element => {
  const { pathname } = useRouter();

  return (
    <footer>
      <Row css={waveWrapper}>
        <WaveImg alt='' src='/images/waves/footer-top-haikei.svg' />
      </Row>
      <Row css={waveWrapper}>
        <WaveImg alt='' src='/images/waves/footer-bottom-haikei.svg' />
      </Row>
      <Row css={footerBackground}>
        <Container as='div' css={{ p: 'calc(3 * $md)', ta: 'center' }}>
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
                  }}>
                  {text}
                </Link>
              </NextLink>
            ))}
          </Container>
          <Container css={{ p: '$lg 0' }}>
            <Copyright />
          </Container>
        </Container>
      </Row>
    </footer>
  );
};
