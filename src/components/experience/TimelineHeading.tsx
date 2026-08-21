import { Flex, Title } from '@mantine/core';
import type { FC, JSX } from 'react';

export const TimelineHeading: FC<{ icon: JSX.Element; title: string }> = ({
  icon,
  title,
}) => (
  <Flex align={{ base: 'center', xs: 'end' }}>
    <Flex
      align='center'
      bg='shamrock'
      h={{ base: '2rem', xs: '2.5rem' }}
      justify='center'
      ml={{ base: -3, xs: 0 }}
      mr='1.25rem'
      style={{ borderRadius: '100%' }}
      w={{ base: '2rem', xs: '2.5rem' }}>
      {icon}
    </Flex>
    <Title order={2}>{title}</Title>
  </Flex>
);
