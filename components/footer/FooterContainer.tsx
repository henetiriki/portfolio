import { Box, useMantineTheme } from '@mantine/core';
import type { BoxProps } from '@mantine/core';
import type { FC } from 'react';

export const FooterContainer: FC<BoxProps> = props => {
  const {
    headings: { fontFamily: footerFf },
  } = useMantineTheme();

  return <Box ff={footerFf} mx='auto' p='lg' ta='center' w='100%' {...props} />;
};
