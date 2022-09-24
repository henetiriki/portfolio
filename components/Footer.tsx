import { Container, Link } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Copyright, Logo } from '@components';
import { menuItems } from '@fixtures';
import { useMediaQuery } from '@hooks';

export const Footer: FC = (): JSX.Element => {
  const isSm = useMediaQuery(960);
  const { pathname } = useRouter();

  return (
    <Container as='footer' css={{ minWidth: '100vw', position: 'relative' }}>
      <Container
        as='div'
        css={{
          backgroundImage: 'url(/images/footer/wave-upper.png)',
          backgroundPosition: 'bottom center',
          backgroundRepeat: isSm ? 'no-repeat' : 'repeat',
          backgroundSize: isSm ? 'cover' : 'contain',
          height: '65px',
          left: 0,
          minWidth: '100vw',
          position: 'absolute',
          right: 0,
          top: '-65px',
          zIndex: 1,
        }}
      />
      <Container
        as='div'
        css={{
          backgroundImage: 'url(/images/footer/wave-lower.png)',
          backgroundPosition: isSm ? 'top left' : 'top center',
          backgroundRepeat: isSm ? 'no-repeat' : 'repeat',
          backgroundSize: isSm ? 'cover' : 'contain',
          height: isSm ? '100px' : '65px',
          left: 0,
          minWidth: '100vw',
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 1,
        }}
      />
      <Container
        as='div'
        css={{
          backgroundColor: '$black-russian',
          bottom: 0,
          height: 'fit-content',
          left: 0,
          minWidth: '100vw',
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 0,
        }}>
        <Container
          as='div'
          css={{ paddingTop: 'calc(3 * $xl)', textAlign: 'center' }}>
          <Container>
            <Logo />
          </Container>
          <Container
            css={{
              alignItems: 'center',
              columnGap: '$md',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              padding: '$lg 0',
              rowGap: '$md',
            }}>
            {menuItems.map(({ href, text }, idx) => (
              <Link
                css={{
                  color: '$white',
                  fontWeight: pathname === href ? 'bold' : 'normal',
                }}
                href={href}
                key={idx}>
                {text}
              </Link>
            ))}
          </Container>
          <Container css={{ padding: '$lg 0' }}>
            <Copyright />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};
