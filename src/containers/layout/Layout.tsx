import { Box, Flex } from '@mantine/core';
import dynamic from 'next/dynamic';
import classes from './Layout.module.css';
import type { FC, JSX, PropsWithChildren } from 'react';

const DynamicFooter = dynamic(
  () => import('@components/footer').then(mod => mod.Footer),
  {
    ssr: false,
  }
);

export const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Flex direction='column' h='100%'>
    <Box className={classes.main} component='main' flex={1}>
      {children}
    </Box>
    <DynamicFooter />
  </Flex>
);
