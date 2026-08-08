import { Box, Flex } from '@mantine/core';
import dynamic from 'next/dynamic';
import type { FC, JSX, PropsWithChildren } from 'react';

const DynamicFooter = dynamic(
  () => import('@components/footer').then(mod => mod.Footer),
  {
    ssr: false,
  }
);

export const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Flex direction='column' h='100%'>
    <Box component='main' flex={1} style={{ overflow: 'auto' }}>
      {children}
    </Box>
    <DynamicFooter />
  </Flex>
);
