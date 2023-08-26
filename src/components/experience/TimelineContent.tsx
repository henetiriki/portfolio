import { Box } from '@mantine/core';
import { timelineContent } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const TimelineContent: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={timelineContent}>{children}</Box>
);
