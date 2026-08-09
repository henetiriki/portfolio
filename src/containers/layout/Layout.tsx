import { Box, Flex } from '@mantine/core';
import { Footer } from '@components/footer';
import classes from './Layout.module.css';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Flex direction='column' h='100%'>
    <Box className={classes.main} component='main' flex={1}>
      {children}
    </Box>
    <Footer />
  </Flex>
);
