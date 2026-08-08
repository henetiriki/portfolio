import { Box } from '@mantine/core';
import classes from './TimelineBox.module.css';
import type { FC, PropsWithChildren } from 'react';

export const TimelineBox: FC<PropsWithChildren> = ({ children }) => (
  <Box className={classes.box} pl={40} pos='relative' pt={50}>
    {children}
  </Box>
);
