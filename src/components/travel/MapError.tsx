import { Box, Container, Text, Title } from '@mantine/core';
import classes from './Map.module.css';
import type { FC } from 'react';

export const MapError: FC = () => (
  <Box className={classes.mapContainer} p={{ base: '2rem 1.5rem', xs: '4rem' }}>
    <Container px={{ base: 0, xs: 'md' }}>
      <Title order={2}>Something’s gone wrong</Title>
      <Text>The map failed to load - please try again later.</Text>
    </Container>
  </Box>
);
