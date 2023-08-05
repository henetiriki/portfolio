export type DynamicPolylineText = {
  color: string;
  style: 'dotted' | 'solid';
};

export const legendContainer = {
  /* eslint-disable sort-keys/sort-keys-fix */
  d: 'flex',
  fd: 'column',
  '@xs': {
    fd: 'row',
    fw: 'wrap',
    jc: 'start',
  },
  /* eslint-enable sort-keys/sort-keys-fix */
};

export const markerText = {
  minWidth: '14rem',
  svg: {
    verticalAlign: 'middle',
  },
};

export const dynamicPolylineText = ({ color, style }: DynamicPolylineText) => ({
  d: 'flex',
  minWidth: '14rem',
  span: {
    borderBottom: `3px ${style} ${color}`,
    height: '1em',
    ml: '5px',
    mr: '7px',
    width: '12px',
  },
});
