import { Box, useMantineTheme } from '@mantine/core';
import type { BoxProps } from '@mantine/core';
import type { FC } from 'react';

export const FooterContainer: FC<BoxProps> = ({ children, ...others }) => {
  const {
    headings: { fontFamily: footerFf },
  } = useMantineTheme();

  return (
    <Box ff={footerFf} mx='auto' p='lg' ta='center' w='100%' {...others}>
      {children}
    </Box>
  );
};
