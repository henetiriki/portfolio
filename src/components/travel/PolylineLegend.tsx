import { Text } from '@mantine/core';
import { dynamicPolylineText } from '@styles/travel';
import type { DynamicPolylineText } from '@styles/travel';
import type { FC, PropsWithChildren } from 'react';

export const PolylineLegend: FC<DynamicPolylineText & PropsWithChildren> = ({
  children,
  ...props
}) => (
  <Text component='p' sx={{ ...dynamicPolylineText(props) }}>
    <span /> {children}
  </Text>
);
