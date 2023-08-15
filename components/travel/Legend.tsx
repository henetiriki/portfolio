import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Flex, Space, Title, useMantineTheme } from '@mantine/core';
import { MarkerLegend } from '@components/travel/MarkerLegend';
import { PolylineLegend } from '@components/travel/PolylineLegend';
import type { FC } from 'react';

export const Legend: FC = () => {
  const {
    colors: { alizarin, allports, corn, pineGreen, pumpkin, torchRed, viking },
  } = useMantineTheme();

  return (
    <>
      <Title order={3}>Legend</Title>
      <Space h='md' />
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        justify='start'
        wrap='wrap'>
        <MarkerLegend color={torchRed[4]} icon={faLocationDot}>
          current location
        </MarkerLegend>
        <MarkerLegend color={pumpkin[4]} icon={faLocationDot}>
          past locations
        </MarkerLegend>
        <MarkerLegend color={pineGreen[4]} icon={faLocationDot}>
          airports
        </MarkerLegend>
        <MarkerLegend color={alizarin[4]} icon={faLocationDot}>
          stations
        </MarkerLegend>
        <MarkerLegend color={allports[4]} icon={faLocationDot}>
          ports
        </MarkerLegend>
        <PolylineLegend color={corn[4]} style='solid'>
          flights
        </PolylineLegend>
        <PolylineLegend color={torchRed[4]} style='solid'>
          train rides
        </PolylineLegend>
        <PolylineLegend color={viking[4]} style='solid'>
          sailings
        </PolylineLegend>
        <PolylineLegend color={corn[4]} style='dotted'>
          upcoming flights
        </PolylineLegend>
        <PolylineLegend color={torchRed[4]} style='dotted'>
          upcoming train rides
        </PolylineLegend>
        <PolylineLegend color={viking[4]} style='dotted'>
          upcoming sailings
        </PolylineLegend>
      </Flex>
    </>
  );
};
