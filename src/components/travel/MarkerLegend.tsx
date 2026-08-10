import { Text } from '@mantine/core';
import { markerIconPath } from '@fixtures/travel/icons';
import classes from './MarkerLegend.module.css';
import type { MarkerIcon } from '@fixtures/travel/types';
import type { FC, PropsWithChildren } from 'react';

export const MarkerLegend: FC<PropsWithChildren & { icon: MarkerIcon }> = ({
  children,
  icon,
}) => (
  <Text component='p' miw='14rem'>
    <span className={classes.iconSlot}>
      <svg
        aria-hidden='true'
        className={classes.icon}
        focusable='false'
        style={{ transform: `scale(${icon.scale})` }}
        viewBox='0 0 24 24'>
        <path d={markerIconPath} fill={icon.color} fillOpacity={0.95} />
      </svg>
    </span>{' '}
    {children}
  </Text>
);
