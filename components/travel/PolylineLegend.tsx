import styled from '@emotion/styled';
import type { DynamicPolylineText } from '@styles/travel';
import type { FC, PropsWithChildren } from 'react';

export const PolylineLegend: FC<DynamicPolylineText & PropsWithChildren> = ({
  children,
}) => {
  const PolylineText = styled.div``;

  return (
    <PolylineText>
      <span /> {children}
    </PolylineText>
  );
};
