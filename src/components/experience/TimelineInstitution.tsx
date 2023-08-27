import { Anchor, Text } from '@mantine/core';
import type { Institution } from '@fixtures/types';
import type { MantineTheme } from '@mantine/core';
import type { FC } from 'react';

export const TimelineInstitution: FC<Omit<Institution, 'location'>> = ({
  name,
  url,
}) => (
  <Text fz='1.25rem' mb={0}>
    {url && (
      <Anchor
        c='shamrock'
        href={url}
        rel='noopener noreferrer'
        sx={({ colors: { shamrock } }: MantineTheme) => ({
          '&:hover': {
            color: shamrock[5],
            textDecoration: 'none',
          },
          span: {
            fontSize: '0.75rem',
            fontStyle: 'italic',
          },
        })}
        target='_blank'>
        {name}
      </Anchor>
    )}
    {!url && <>{name}</>}
  </Text>
);
