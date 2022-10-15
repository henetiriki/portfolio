import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Text, styled } from '@nextui-org/react';
import { markerText } from '@styles/travel';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { FC, PropsWithChildren } from 'react';

const MarkerText = styled(Text, markerText);

export const MarkerLegend: FC<
  PropsWithChildren & { color: string; icon: IconProp }
> = ({ children, color, icon }) => (
  <MarkerText>
    <FontAwesomeIcon color={color} height={20} icon={icon} width={20} />{' '}
    {children}
  </MarkerText>
);
