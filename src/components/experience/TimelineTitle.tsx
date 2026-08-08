import { Title } from '@mantine/core';
import classes from './TimelineTitle.module.css';
import type { FC, JSX } from 'react';

export const TimelineTitle: FC<{ title: JSX.Element | string }> = ({
  title,
}) => (
  <Title className={classes.title} order={3}>
    {title}
  </Title>
);
