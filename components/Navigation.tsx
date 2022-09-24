import { Container, Link, Navbar } from '@nextui-org/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { Logo } from '@components';
import { menuItems } from '@fixtures';
import { navLinkMd, navLinkSm, navTypography } from '@styles';

export const Navigation: FC = (): JSX.Element => {
  const { pathname } = useRouter();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [navExpanded, setNavExpanded] = useState(false);
  const [navContainerBgColor, setNavContainerBgColor] = useState('transparent');

  useEffect(() => {
    if (navExpanded) {
      if (navContainerBgColor !== '$black-russian') {
        setNavContainerBgColor('$black-russian');
      }

      return;
    }

    if (scrollPosition > 10) {
      if (navContainerBgColor !== '$black-russian') {
        setNavContainerBgColor('$black-russian');
      }

      return;
    }

    if (navContainerBgColor !== 'transparent') {
      setNavContainerBgColor('transparent');
    }
  }, [
    navContainerBgColor,
    scrollPosition,
    navExpanded,
    setNavContainerBgColor,
  ]);

  return (
    <Navbar
      containerCss={{ backgroundColor: navContainerBgColor, minWidth: '100vw' }}
      disableBlur
      disableShadow
      onScrollPositionChange={setScrollPosition}
      variant='sticky'>
      <Navbar.Toggle
        // @ts-ignore
        onChange={setNavExpanded}
        showIn='xs'
      />
      <Container
        css={{
          '@xs': {
            justifyContent: 'space-between',
          },
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
        <Navbar.Brand
          css={{
            '@xs': {
              w: '12%',
            },
          }}>
          <Logo />
        </Navbar.Brand>
        <Navbar.Content css={navTypography} hideIn='xs'>
          {menuItems.map(({ href, text }, idx) => {
            const isActive = href === pathname;

            return (
              <NextLink href={href} key={idx} passHref>
                <Navbar.Link
                  className={isActive ? 'active' : ''}
                  css={navLinkMd}
                  isActive>
                  {text}
                </Navbar.Link>
              </NextLink>
            );
          })}
        </Navbar.Content>
      </Container>
      <Navbar.Collapse isOpen={navExpanded}>
        {menuItems.map(({ href, text }, idx) => {
          const isActive = href === pathname;

          return (
            <Navbar.CollapseItem css={navTypography} isActive key={idx}>
              <NextLink href={href} passHref>
                <Link className={isActive ? 'active' : ''} css={navLinkSm}>
                  {text}
                </Link>
              </NextLink>
            </Navbar.CollapseItem>
          );
        })}
      </Navbar.Collapse>
    </Navbar>
  );
};
