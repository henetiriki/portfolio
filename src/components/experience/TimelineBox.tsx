import { Box } from '@mantine/core';
import { timelineBox } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const TimelineBox: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={timelineBox}>{children}</Box>
);
