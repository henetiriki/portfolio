import { Box } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const Timeline: FC<PropsWithChildren> = ({ children }) => (
  <Box
    mb={40}
    ml={{ base: 13, xs: 20 }}
    mt={{ base: -8, xs: 0 }}
    style={{ borderLeft: '1px solid var(--mantine-color-silver-4)' }}>
    {children}
  </Box>
);
