import { Box } from '@mantine/core';
import { footerLines } from '@styles/footer';
import type { BoxProps } from '@mantine/core';
import type { FC } from 'react';

export const FooterLines: FC<BoxProps> = props => (
  <Box
    mx='auto'
    opacity={0.5}
    sx={footerLines}
    w={{ base: '85%', md: '50%' }}
    {...props}
  />
);
