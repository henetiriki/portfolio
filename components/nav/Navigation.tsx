import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Link, Navbar, styled } from '@nextui-org/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@components/shared';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import {
  navBrand,
  navLinkMd,
  navLinkSm,
  navTopContainer,
  navTypography,
  scrollToTop,
} from '@styles/nav';
import type { FC, MouseEvent, MutableRefObject } from 'react';

const ScrollToTop = styled('a', scrollToTop);

export const Navigation: FC = (): JSX.Element => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { pathname } = useRouter();
  const { scrollToTop } = useScrollTo(pageTopRef);
  const navToggleRef = useRef() as MutableRefObject<any>;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [navContainerBgColor, setNavContainerBgColor] = useState('transparent');

  useEffect(() => {
    if (navExpanded) {
      if (navContainerBgColor !== '$blackRussian') {
        setNavContainerBgColor('$blackRussian');
      }

      return;
    }

    if (scrollPosition > 10) {
      if (navContainerBgColor !== '$blackRussian') {
        setNavContainerBgColor('$blackRussian');
        setScrollToTopVisible(true);
      }

      return;
    }

    if (navContainerBgColor !== 'transparent') {
      setNavContainerBgColor('transparent');
      setScrollToTopVisible(false);
    }
  }, [
    navContainerBgColor,
    scrollPosition,
    navExpanded,
    setNavContainerBgColor,
  ]);

  return (
    <>
      <Navbar
        containerCss={{ bgColor: navContainerBgColor, minWidth: '100vw' }}
        disableBlur
        disableShadow
        onScrollPositionChange={setScrollPosition}
        variant='sticky'>
        <Navbar.Toggle
          // @ts-ignore
          onChange={setNavExpanded}
          ref={navToggleRef}
          showIn='xs'
        />
        <Container css={navTopContainer}>
          <Navbar.Brand css={navBrand}>
            <Logo />
          </Navbar.Brand>
          <Navbar.Content css={navTypography} hideIn='xs'>
            {menuItems.map(({ href, text }, idx) => {
              const isActive = href === pathname;

              return (
                <Navbar.Link
                  as='span'
                  className={isActive ? 'active' : ''}
                  css={navLinkMd}
                  isActive
                  key={idx}
                  onClick={scrollToTop}>
                  <NextLink href={href}>{text}</NextLink>
                </Navbar.Link>
              );
            })}
          </Navbar.Content>
        </Container>
        <Navbar.Collapse isOpen={navExpanded}>
          {menuItems.map(({ href, text }, idx) => {
            const isActive = href === pathname;

            return (
              <Navbar.CollapseItem css={navTypography} isActive key={idx}>
                <Link
                  as='span'
                  className={isActive ? 'active' : ''}
                  css={navLinkSm}
                  // work-around for mobile nav not closing on click
                  onClick={() => {
                    navToggleRef.current?.click();
                    scrollToTop();
                  }}>
                  <NextLink href={href}>{text}</NextLink>
                </Link>
              </Navbar.CollapseItem>
            );
          })}
        </Navbar.Collapse>
      </Navbar>
      {scrollToTopVisible && (
        <ScrollToTop
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            scrollToTop();
          }}>
          <FontAwesomeIcon height={15} icon={faArrowUp} width={15} />
        </ScrollToTop>
      )}
    </>
  );
};
