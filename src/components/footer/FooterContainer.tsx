import { Box } from '@mantine/core';
import type { BoxProps } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const FooterContainer: FC<PropsWithChildren<BoxProps>> = ({
  children,
  ...others
}) => (
  <Box mx='auto' p='lg' ta='center' w='100%' {...others}>
    {children}
  </Box>
);
