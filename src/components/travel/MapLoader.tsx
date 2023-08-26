import { Flex, Loader } from '@mantine/core';
import type { FC } from 'react';

export const MapLoader: FC = () => (
  <Flex align='center' h='65vh' justify='center' w='100vw'>
    <Loader />
  </Flex>
);
