import { Box } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const Timeline: FC<PropsWithChildren> = ({ children }) => (
  <Box
    mb={40}
    ml={20}
    sx={({ colors: { silver } }: MantineTheme) => ({
      borderLeft: `1px solid ${silver[4]}`,
    })}>
    {children}
  </Box>
);
