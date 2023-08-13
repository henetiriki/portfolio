import { Box } from '@mantine/core';
import { timelineIndicator } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const TimelineIndicator: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={timelineIndicator}>{children}</Box>
);
