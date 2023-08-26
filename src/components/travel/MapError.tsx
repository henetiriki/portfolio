import { Container, Text, Title } from '@mantine/core';
import type { FC } from 'react';

export const MapError: FC = () => (
  <Container>
    <Title order={2}>Something’s gone wrong</Title>
    <Text>The map failed to load - please try again later.</Text>
  </Container>
);
