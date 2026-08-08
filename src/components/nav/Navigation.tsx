import {
  Box,
  Burger,
  Container,
  Drawer,
  Group,
  ScrollArea,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowMoveUp } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NavigationLink } from '@components/nav/NavigationLink';
import { Logo } from '@components/shared';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import classes from './Navigation.module.css';
import type { MouseEvent } from 'react';

export const Navigation = () => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { pathname } = useRouter();
  const { scrollToTop } = useScrollTo(pageTopRef);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const [navBgTransparent, setNavBgTransparent] = useState(true);
  const [drawerOpened, { close: closeDrawer, toggle: toggleDrawer }] =
    useDisclosure(false);

  useEffect(() => {
    const onScrollPositionChange: EventListener = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', onScrollPositionChange);

    return () => {
      window.removeEventListener('scroll', onScrollPositionChange);
    };
  }, []);

  useEffect(() => {
    if (drawerOpened) {
      if (navBgTransparent) {
        setNavBgTransparent(false);
      }

      return;
    }

    if (scrollPosition > 10) {
      if (navBgTransparent) {
        setNavBgTransparent(false);
        setScrollToTopVisible(true);
      }

      return;
    }

    if (!navBgTransparent) {
      setNavBgTransparent(true);
      setScrollToTopVisible(false);
    }
  }, [drawerOpened, navBgTransparent, scrollPosition]);

  return (
    <>
      <Box left={0} pos='sticky' right={0} style={{ zIndex: 200 }} top={0}>
        <Box
          bg={navBgTransparent ? 'transparent' : 'blackRussian'}
          component='header'
          px='xl'
          style={{
            alignItems: 'center',
            borderBottom: 'none',
            height: rem(76),
          }}>
          <Container h={'100%'}>
            <Group justify='space-between' style={{ height: '100%' }}>
              <Logo />
              <Group className={classes.desktopLinks} gap={0}>
                {menuItems.map(({ href, text }) => (
                  <Box key={href} pos='relative'>
                    <NavigationLink
                      href={href}
                      onClickCb={scrollToTop}
                      pathname={pathname}>
                      {text}
                    </NavigationLink>
                  </Box>
                ))}
              </Group>

              <Burger
                aria-label={drawerOpened ? 'Close menu' : 'Open menu'}
                className={classes.burger}
                onClick={toggleDrawer}
                opened={drawerOpened}
              />
            </Group>
          </Container>
        </Box>

        <Drawer
          className={classes.drawer}
          onClose={closeDrawer}
          opened={drawerOpened}
          padding='md'
          size='100%'
          zIndex={1000000}>
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx='-md'>
            {menuItems.map(({ href, text }) => (
              <Box key={href} pos='relative'>
                <NavigationLink
                  href={href}
                  onClickCb={() => {
                    toggleDrawer();
                    scrollToTop();
                  }}
                  pathname={pathname}
                  variant={'sm'}>
                  {text}
                </NavigationLink>
              </Box>
            ))}
          </ScrollArea>
        </Drawer>
      </Box>
      {scrollToTopVisible && (
        <Box
          aria-label='Scroll to top'
          bg='matterhorn'
          bottom={20}
          className={classes.scrollToTop}
          component='a'
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            scrollToTop();
          }}
          p='10px 8px 5px'
          pos='fixed'
          right={30}
          role='button'
          ta='center'>
          <IconArrowMoveUp size={15} />
        </Box>
      )}
    </>
  );
};
