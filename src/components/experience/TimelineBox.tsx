import { Box } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const TimelineBox: FC<PropsWithChildren> = ({ children }) => (
  <Box
    pl={40}
    pos='relative'
    pt={50}
    sx={({ colors: { shamrock } }: MantineTheme) => ({
      '&:after': {
        backgroundColor: shamrock[4],
        borderRadius: '100%',
        content: "''",
        height: '20px',
        left: '-11px',
        opacity: 0.4,
        position: 'absolute',
        top: '70px',
        width: '20px',
      },
      '&:before': {
        backgroundColor: shamrock[4],
        borderRadius: '100%',
        content: "''",
        height: '10px',
        left: '-6px',
        position: 'absolute',
        top: '75px',
        width: '10px',
      },
    })}>
    {children}
  </Box>
);
