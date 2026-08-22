import { Flex, Space, Title, useMantineTheme } from '@mantine/core';
import { MarkerLegend } from '@components/travel/MarkerLegend';
import { PolylineLegend } from '@components/travel/PolylineLegend';
import {
  airportIcon,
  currentCityIcon,
  portIcon,
  previousCityIcon,
  stationIcon,
} from '@fixtures/travel/icons';
import type { FC } from 'react';

export const Legend: FC = () => {
  const {
    colors: { corn, ['torch-red']: torchRed, viking },
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
        <MarkerLegend icon={currentCityIcon}>current location</MarkerLegend>
        <MarkerLegend icon={previousCityIcon}>past locations</MarkerLegend>
        <MarkerLegend icon={airportIcon}>airports</MarkerLegend>
        <MarkerLegend icon={stationIcon}>stations</MarkerLegend>
        <MarkerLegend icon={portIcon}>ports</MarkerLegend>
        <PolylineLegend colour={corn[4]} style='solid'>
          flights
        </PolylineLegend>
        <PolylineLegend colour={torchRed[4]} style='solid'>
          train rides
        </PolylineLegend>
        <PolylineLegend colour={viking[4]} style='solid'>
          sailings
        </PolylineLegend>
        <PolylineLegend colour={corn[4]} style='dotted'>
          upcoming flights
        </PolylineLegend>
        <PolylineLegend colour={torchRed[4]} style='dotted'>
          upcoming train rides
        </PolylineLegend>
        <PolylineLegend colour={viking[4]} style='dotted'>
          upcoming sailings
        </PolylineLegend>
      </Flex>
    </>
  );
};
