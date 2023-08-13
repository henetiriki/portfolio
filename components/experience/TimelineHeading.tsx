import { Box } from '@mantine/core';
import { timelineHeading } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const TimelineHeading: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={timelineHeading}>{children}</Box>
);
