import { Text } from '@mantine/core';
import classes from './TimelineLocation.module.css';
import type { FC, JSX } from 'react';

export const TimelineLocation: FC<{ location: JSX.Element | string }> = ({
  location,
}) => (
  <Text c='silver' className={classes.location} mb={16} mt={0} size='sm'>
    {location}
  </Text>
);
