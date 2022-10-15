import { Text, styled } from '@nextui-org/react';
import { dynamicPolylineText } from '@styles/travel';
import type { DynamicPolylineText } from '@styles/travel';
import type { FC, PropsWithChildren } from 'react';

export const PolylineLegend: FC<DynamicPolylineText & PropsWithChildren> = ({
  children,
  ...props
}) => {
  const PolylineText = styled(Text, dynamicPolylineText(props));

  return (
    <PolylineText>
      <span /> {children}
    </PolylineText>
  );
};
