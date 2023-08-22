import { Flex } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const TimelineHeading: FC<PropsWithChildren> = ({ children }) => (
  <Flex align='end'>{children}</Flex>
);
