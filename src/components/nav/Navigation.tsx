import {
  Anchor,
  Box,
  Burger,
  Container,
  Drawer,
  Group,
  Header,
  ScrollArea,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowMoveUp } from '@tabler/icons-react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Logo } from '@components/shared';
import { menuItems } from '@fixtures/nav';
import { useScrollTo } from '@hooks';
import { usePortfolioState } from '@state/context';
import {
  navDrawer,
  navHiddenDesktop,
  navHiddenMobile,
  navLinkMd,
  navLinkSm,
} from '@styles/nav';
import type { MantineTheme } from '@mantine/core';
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
      <Box
        left={0}
        pos='sticky'
        right={0}
        sx={{
          zIndex: 200,
        }}
        top={0}>
        <Header
          bg={navBgTransparent ? 'transparent' : 'blackRussian'}
          height={76}
          px='xl'
          sx={{
            alignItems: 'center',
            borderBottom: 'none',
          }}>
          <Container h={'100%'}>
            <Group position='apart' sx={{ height: '100%' }}>
              <Logo />
              <Group spacing={0} sx={navHiddenMobile}>
                {menuItems.map(({ href, text }) => (
                  <Box key={href} pos='relative'>
                    <Anchor
                      className={href === pathname ? 'active' : ''}
                      component={NextLink}
                      href={href}
                      onClick={scrollToTop}
                      sx={navLinkMd}>
                      {text}
                    </Anchor>
                  </Box>
                ))}
              </Group>

              <Burger
                onClick={toggleDrawer}
                opened={drawerOpened}
                sx={navHiddenDesktop}
              />
            </Group>
          </Container>
        </Header>

        <Drawer
          onClose={closeDrawer}
          opened={drawerOpened}
          padding='md'
          size='100%'
          sx={navDrawer}
          zIndex={1000000}>
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx='-md'>
            {menuItems.map(({ href, text }) => (
              <Box key={href} pos='relative'>
                <Anchor
                  className={href === pathname ? 'active' : ''}
                  component={NextLink}
                  href={href}
                  onClick={() => {
                    toggleDrawer();
                    scrollToTop();
                  }}
                  sx={navLinkSm}>
                  {text}
                </Anchor>
              </Box>
            ))}
          </ScrollArea>
        </Drawer>
      </Box>
      {scrollToTopVisible && (
        <Box
          bg='matterhorn'
          bottom={20}
          component='a'
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            scrollToTop();
          }}
          p='10px 8px 5px'
          pos='fixed'
          right={30}
          sx={({ colors: { shamrock } }: MantineTheme) => ({
            '&:hover': {
              backgroundColor: shamrock[4],
            },
            borderRadius: '40px',
            cursor: 'pointer',
            outline: 'none',
            zIndex: 2,
          })}
          ta='center'>
          <IconArrowMoveUp size={15} />
        </Box>
      )}
    </>
  );
};
