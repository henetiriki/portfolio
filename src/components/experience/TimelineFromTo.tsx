import { Text } from '@mantine/core';
import type { Year } from '@fixtures/types';
import type { MantineTheme } from '@mantine/core';
import type { FC } from 'react';

export const TimelineFromTo: FC<{ year: Year }> = ({ year: { from, to } }) => (
  <Text
    fs='italic'
    span
    sx={({ colors: { silver } }: MantineTheme) => ({
      color: silver[4],
    })}>
    {from} - {to}
  </Text>
);
