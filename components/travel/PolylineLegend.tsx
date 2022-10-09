import { Text, styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';

type DynamicPolylineText = {
  color: string;
  style: 'dotted' | 'solid';
};

const dynamicPolylineText = ({ color, style }: DynamicPolylineText) =>
  styled(Text, {
    d: 'flex',
    span: {
      borderBottom: `3px ${style} ${color}`,
      height: '1em',
      ml: '5px',
      mr: '7px',
      width: '12px',
    },
  });

export const PolylineLegend: FC<DynamicPolylineText & PropsWithChildren> = ({
  children,
  ...props
}) => {
  const PolylineText = dynamicPolylineText(props);

  return (
    <PolylineText>
      <span /> {children}
    </PolylineText>
  );
};
