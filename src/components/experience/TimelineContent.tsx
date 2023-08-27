import { Box, rem } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const TimelineContent: FC<PropsWithChildren> = ({ children }) => (
  <Box
    p={24}
    pos='relative'
    sx={({ fn: { rgba }, white }: MantineTheme) => ({
      '&:before': {
        borderColor: `transparent ${rgba(white, 0.1)} transparent transparent`,
        borderStyle: 'solid',
        borderWidth: '15px 20px 15px 0',
        content: "''",
        height: 0,
        position: 'absolute',
        right: '100%',
        top: '15px',
        width: 0,
      },
      backgroundColor: rgba(white, 0.1),
      borderRadius: rem(8),
    })}>
    {children}
  </Box>
);
