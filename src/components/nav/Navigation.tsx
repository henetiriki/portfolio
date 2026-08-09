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
  const [drawerOpened, { close: closeDrawer, toggle: toggleDrawer }] =
    useDisclosure(false);
  const navBgTransparent = !drawerOpened && scrollPosition <= 10;
  const scrollToTopVisible = scrollPosition > 10;

  useEffect(() => {
    const onScrollPositionChange: EventListener = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', onScrollPositionChange);

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
