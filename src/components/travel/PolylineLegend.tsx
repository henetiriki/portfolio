import { Text } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

type DynamicPolylineText = {
  color: string;
  style: 'dotted' | 'solid';
};

export const PolylineLegend: FC<DynamicPolylineText & PropsWithChildren> = ({
  children,
  color,
  style,
}) => (
  <Text component='p' display='flex' miw='14rem'>
    <Text
      component='span'
      h='1em'
      ml={5}
      mr={7}
      style={{ borderBottom: `3px ${style} ${color}` }}
      w={12}
    />{' '}
    {children}
  </Text>
);
