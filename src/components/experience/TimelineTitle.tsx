import { Title } from '@mantine/core';
import type { FC, JSX } from 'react';

export const TimelineTitle: FC<{ title: JSX.Element | string }> = ({
  title,
}) => (
  <Title
    order={3}
    sx={{
      span: {
        fontSize: '1.25rem',
      },
    }}>
    {title}
  </Title>
);
