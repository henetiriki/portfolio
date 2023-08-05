import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { FC, PropsWithChildren } from 'react';

const MarkerText = styled.div``;

export const MarkerLegend: FC<
  PropsWithChildren & { color: string; icon: IconProp }
> = ({ children, color, icon }) => (
  <MarkerText>
    <FontAwesomeIcon color={color} height={20} icon={icon} width={20} />{' '}
    {children}
  </MarkerText>
);
