import {
  ActionIcon,
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
import { useEffect, useRef, useState } from 'react';
import { NavigationLink } from '@components/nav/NavigationLink';
import { Logo } from '@components/shared';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import classes from './Navigation.module.css';

export const Navigation = () => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const { pathname } = useRouter();
  const { scrollToTop } = useScrollTo(pageTopRef);
  const scrolledPastThresholdRef = useRef(false);
  const [scrolledPastThreshold, setScrolledPastThreshold] = useState(false);
  const [drawerOpened, { close: closeDrawer, toggle: toggleDrawer }] =
    useDisclosure(false);
  const navBgTransparent = !drawerOpened && !scrolledPastThreshold;

  useEffect(() => {
    const onScrollPositionChange = () => {
      const nextScrolledPastThreshold = window.scrollY > 10;

      if (scrolledPastThresholdRef.current !== nextScrolledPastThreshold) {
        scrolledPastThresholdRef.current = nextScrolledPastThreshold;
        setScrolledPastThreshold(nextScrolledPastThreshold);
      }
    };

    onScrollPositionChange();
    window.addEventListener('scroll', onScrollPositionChange, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScrollPositionChange);
    };
  }, []);

  return (
    <>
      <Box className={classes.root} left={0} pos='sticky' right={0} top={0}>
        <Box
          bd='none'
          bg={navBgTransparent ? 'transparent' : 'black-russian'}
          component='header'
          h={rem(76)}
          px='xl'>
          <Container h='100%'>
            <Group h='100%' justify='space-between'>
              <Logo />
              {/* Both navigations share a label because only one is ever in
                  the accessibility tree: Navigation.module.css hides the other
                  with `display: none`, which removes it entirely. */}
              <Group
                aria-label='Main'
                className={classes.desktopLinks}
                component='nav'
                gap={0}>
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
                style={{ visibility: drawerOpened ? 'hidden' : undefined }}
              />
            </Group>
          </Container>
        </Box>

        <Drawer
          className={classes.drawer}
          classNames={{
            body: classes.drawerBody,
            close: classes.drawerClose,
            content: classes.drawerContent,
            header: classes.drawerHeader,
          }}
          closeButtonProps={{ 'aria-label': 'Close menu' }}
          onClose={closeDrawer}
          opened={drawerOpened}
          padding='md'
          size='100%'
          zIndex={1000000}>
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx='-md'>
            <Box aria-label='Main' component='nav'>
              {menuItems.map(({ href, text }) => (
                <Box key={href} pos='relative'>
                  <NavigationLink
                    href={href}
                    onClickCb={() => {
                      closeDrawer();
                      scrollToTop();
                    }}
                    pathname={pathname}
                    variant={'sm'}>
                    {text}
                  </NavigationLink>
                </Box>
              ))}
            </Box>
          </ScrollArea>
        </Drawer>
      </Box>
      {scrolledPastThreshold && (
        <ActionIcon
          aria-label='Scroll to top'
          bottom={20}
          className={classes.scrollToTop}
          color='matterhorn.4'
          onClick={scrollToTop}
          pos='fixed'
          radius='xl'
          right={30}
          size={44}
          variant='filled'>
          <IconArrowMoveUp size={20} />
        </ActionIcon>
      )}
    </>
  );
};
