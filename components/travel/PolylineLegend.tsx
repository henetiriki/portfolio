import { Text, styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
import { DynamicPolylineText, dynamicPolylineText } from '@styles/travel';

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
