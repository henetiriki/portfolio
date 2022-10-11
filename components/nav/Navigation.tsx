import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Link, Navbar, styled } from '@nextui-org/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  FC,
  MouseEvent,
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Logo } from '@components/shared';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import {
  navBrand,
  navLinkMd,
  navLinkSm,
  navTopContainer,
  navTypography,
  scrollToTop,
} from '@styles/nav';

const ScrollToTop = styled('a', scrollToTop);

export const Navigation: FC<{
  pageTopRef: RefObject<HTMLDivElement> | undefined;
}> = ({ pageTopRef }): JSX.Element => {
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
                <NextLink href={href} key={idx} passHref>
                  <Navbar.Link
                    className={isActive ? 'active' : ''}
                    css={navLinkMd}
                    isActive
                    onClick={scrollToTop}>
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
                  <Link
                    className={isActive ? 'active' : ''}
                    css={navLinkSm}
                    // work-around for mobile nav not closing on click
                    onClick={() => {
                      navToggleRef.current?.click();
                      scrollToTop();
                    }}>
                    {text}
                  </Link>
                </NextLink>
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
