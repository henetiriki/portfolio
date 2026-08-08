import { Box } from '@mantine/core';
import classes from './TimelineContent.module.css';
import type { FC, PropsWithChildren } from 'react';

export const TimelineContent: FC<PropsWithChildren> = ({ children }) => (
  <Box className={classes.content} p={24} pos='relative'>
    {children}
  </Box>
);
