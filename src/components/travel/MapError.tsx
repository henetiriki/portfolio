import { Box, Button, Container, Space, Text, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import classes from './Map.module.css';
import type { FC } from 'react';

export const MapError: FC = () => (
  <Box className={classes.mapContainer} p={{ base: '2rem 1.5rem', xs: '4rem' }}>
    <Container px={{ base: 0, xs: 'md' }}>
      <Title order={2}>Something’s gone wrong</Title>
      <Text>The map failed to load - please try again later.</Text>
      <Space h='md' />
      <Button
        color='shamrock.4'
        leftSection={<IconRefresh size={21} />}
        onClick={() => window.location.reload()}
        radius='lg'
        size='lg'
        variant='outline'
        w={{ base: '100%', md: '25%', sm: '35%' }}>
        Reload page
      </Button>
    </Container>
  </Box>
);
