import { Box } from '@mantine/core';
import { timeline } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const Timeline: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={timeline}>{children}</Box>
);
