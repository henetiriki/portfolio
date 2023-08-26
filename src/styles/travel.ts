import type { Sx } from '@mantine/core';

export type DynamicPolylineText = {
  color: string;
  style: 'dotted' | 'solid';
};

export const markerText: Sx = {
  minWidth: '14rem',
  svg: {
    verticalAlign: 'middle',
  },
};

export const dynamicPolylineText = ({
  color,
  style,
}: DynamicPolylineText): Sx => ({
  display: 'flex',
  minWidth: '14rem',
  span: {
    borderBottom: `3px ${style} ${color}`,
    height: '1em',
    marginLeft: '5px',
    marginRight: '7px',
    width: '12px',
  },
});
