import { Flex } from '@mantine/core';
import { timelineIndicator } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const TimelineIndicator: FC<PropsWithChildren> = ({ children }) => (
  <Flex
    align='center'
    bg='shamrock'
    h='2.5rem'
    justify='center'
    sx={timelineIndicator}
    w='2.5rem'>
    {children}
  </Flex>
);
