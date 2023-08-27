import { Text } from '@mantine/core';
import type { FC, JSX } from 'react';

export const TimelineLocation: FC<{ location: JSX.Element | string }> = ({
  location,
}) => (
  <Text
    c='silver'
    mb={16}
    size='sm'
    sx={{
      span: {
        fontStyle: 'italic',
      },
    }}>
    {location}
  </Text>
);
