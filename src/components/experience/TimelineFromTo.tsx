import { Text } from '@mantine/core';
import type { Year } from '@fixtures/types';
import type { FC } from 'react';

export const TimelineFromTo: FC<{ year: Year }> = ({ year: { from, to } }) => (
  <Text c='silver.4' fs='italic' span>
    {from} - {to}
  </Text>
);
