import { Flex, Title } from '@mantine/core';
import type { FC, JSX } from 'react';

export const TimelineHeading: FC<{ icon: JSX.Element; title: string }> = ({
  icon,
  title,
}) => (
  <Flex align='end'>
    <Flex
      align='center'
      bg='shamrock'
      h='2.5rem'
      justify='center'
      mr='1.25rem'
      style={{ borderRadius: '100%' }}
      w='2.5rem'>
      {icon}
    </Flex>
    <Title order={2}>{title}</Title>
  </Flex>
);
