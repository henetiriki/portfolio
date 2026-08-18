import { Anchor, Text } from '@mantine/core';
import classes from './TimelineInstitution.module.css';
import type { Institution } from '@fixtures/types';
import type { FC } from 'react';

export const TimelineInstitution: FC<Omit<Institution, 'location'>> = ({
  name,
  url,
}) => (
  <Text fz='xl' mb={0} mt={0}>
    {url && (
      <Anchor
        c='shamrock'
        className={classes.link}
        href={url}
        inherit
        rel='noopener noreferrer'
        target='_blank'>
        {name}
      </Anchor>
    )}
    {!url && <>{name}</>}
  </Text>
);
