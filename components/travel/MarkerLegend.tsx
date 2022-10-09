import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Text, styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
import { markerText } from '@styles/travel';

const MarkerText = styled(Text, markerText);

export const MarkerLegend: FC<
  PropsWithChildren & { color: string; icon: IconProp }
> = ({ children, color, icon }) => (
  <MarkerText>
    <FontAwesomeIcon color={color} height={20} icon={icon} width={20} />{' '}
    {children}
  </MarkerText>
);
