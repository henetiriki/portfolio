import { Text } from '@mantine/core';
import type { Year } from '@fixtures/types';
import type { FC } from 'react';

export const TimelineFromTo: FC<{ year: Year }> = ({ year: { from, to } }) => (
  <Text fs='italic' span style={{ color: 'var(--mantine-color-silver-4)' }}>
    {from} - {to}
  </Text>
);
