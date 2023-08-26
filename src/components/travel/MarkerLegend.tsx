import { Text, rem } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { markerText } from '@styles/travel';
import type { FC, PropsWithChildren } from 'react';

export const MarkerLegend: FC<PropsWithChildren & { color: string }> = ({
  children,
  color,
}) => (
  <Text component='p' sx={markerText}>
    <IconMapPin color={color} size={rem(18)} /> {children}
  </Text>
);
