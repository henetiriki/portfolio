import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Text, styled } from '@nextui-org/react';
import { MarkerLegend } from '@components/travel/MarkerLegend';
import { PolylineLegend } from '@components/travel/PolylineLegend';
import { colors } from '@styles/shared';
import { legendContainer } from '@styles/travel';
import type { FC } from 'react';

const { alizarin, allPorts, pineGreen, pumpkin, torchRed } = colors;
const LegendContainer = styled('div', legendContainer);

export const Legend: FC = () => (
  <>
    <Text css={{ pb: '$lg' }} h3>
      Legend
    </Text>
    <LegendContainer>
      <MarkerLegend color={torchRed} icon={faLocationDot}>
        current location
      </MarkerLegend>
      <MarkerLegend color={pumpkin} icon={faLocationDot}>
        past locations
      </MarkerLegend>
      <MarkerLegend color={pineGreen} icon={faLocationDot}>
        airports
      </MarkerLegend>
      <MarkerLegend color={alizarin} icon={faLocationDot}>
        stations
      </MarkerLegend>
      <MarkerLegend color={allPorts} icon={faLocationDot}>
        ports
      </MarkerLegend>
      <PolylineLegend color='$corn' style='solid'>
        flights
      </PolylineLegend>
      <PolylineLegend color='$torchRed' style='solid'>
        train rides
      </PolylineLegend>
      <PolylineLegend color='$viking' style='solid'>
        sailings
      </PolylineLegend>
      <PolylineLegend color='$corn' style='dotted'>
        upcoming flights
      </PolylineLegend>
      <PolylineLegend color='$torchRed' style='dotted'>
        upcoming train rides
      </PolylineLegend>
      <PolylineLegend color='$viking' style='dotted'>
        upcoming sailings
      </PolylineLegend>
    </LegendContainer>
  </>
);
