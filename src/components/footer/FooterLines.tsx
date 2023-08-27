import { Box } from '@mantine/core';
import type { BoxProps, MantineTheme } from '@mantine/core';
import type { FC } from 'react';

export const FooterLines: FC<BoxProps> = props => (
  <Box
    mx='auto'
    opacity={0.5}
    sx={({ colors: { silver } }: MantineTheme) => ({
      borderTop: `1px solid ${silver[4]}`,
    })}
    w={{ base: '85%', md: '50%' }}
    {...props}
  />
);
