import { Container, Link, styled } from '@nextui-org/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Copyright, Logo } from '@components';
import { menuItems } from '@fixtures';
import { useMediaQuery } from '@hooks';
import {
  footerBackground,
  footerMenuItems,
  footerSmBgPositionHeight,
  footerSmBgRepeatSize,
  footerWaveLower,
  footerWaveUpper,
} from '@styles';

export const Footer: FC = (): JSX.Element => {
  const isSm = useMediaQuery(960);
  const { pathname } = useRouter();

  const UpperWave = styled('div', {
    ...footerWaveUpper,
    ...(isSm && footerSmBgRepeatSize),
  });

  const LowerWave = styled('div', {
    ...footerWaveLower,
    ...(isSm && footerSmBgRepeatSize),
    ...(isSm && footerSmBgPositionHeight),
  });

  const Content = styled('div', footerBackground);

  return (
    <footer>
      <UpperWave />
      <LowerWave />
      <Content>
        <Container
          as='div'
          css={{ paddingTop: 'calc(3 * $md)', textAlign: 'center' }}>
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
          <Container css={{ padding: '$lg 0' }}>
            <Copyright />
          </Container>
        </Container>
      </Content>
    </footer>
  );
};
