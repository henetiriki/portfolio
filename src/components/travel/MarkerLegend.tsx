import { Box, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import type { FC, PropsWithChildren } from 'react';

export const MarkerLegend: FC<PropsWithChildren & { color: string }> = ({
  children,
  color,
}) => (
  <Text component='p' miw='14rem'>
    <Box
      c={color}
      component={IconMapPin}
      size={18}
      sx={{
        verticalAlign: 'middle',
      }}
    />{' '}
    {children}
  </Text>
);
