import { Box } from '@mantine/core';
import { videoContainer } from '@styles/experience';
import type { FC, PropsWithChildren } from 'react';

export const VideoContainer: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={videoContainer}>{children}</Box>
);
