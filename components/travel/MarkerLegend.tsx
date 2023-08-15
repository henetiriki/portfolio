import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Text } from '@mantine/core';
import { markerText } from '@styles/travel';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { FC, PropsWithChildren } from 'react';

export const MarkerLegend: FC<
  PropsWithChildren & { color: string; icon: IconProp }
> = ({ children, color, icon }) => (
  <Text component='p' sx={markerText}>
    <FontAwesomeIcon color={color} height={20} icon={icon} width={20} />{' '}
    {children}
  </Text>
);
