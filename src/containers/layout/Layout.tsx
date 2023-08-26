import { Box } from '@mantine/core';
import dynamic from 'next/dynamic';
import type { FC, JSX, PropsWithChildren } from 'react';

const DynamicFooter = dynamic(
  () => import('@components/footer').then(mod => mod.Footer),
  {
    ssr: false,
  }
);

export const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
    <Box
      component='main'
      sx={{
        flex: 1,
        overflow: 'auto',
      }}>
      {children}
    </Box>
    <DynamicFooter />
  </Box>
);
