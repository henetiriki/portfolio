import { Box, Container } from '@mantine/core';
import { WaveWrapper } from '@components/shared';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Content: FC<
  PropsWithChildren & { waveBottom?: boolean; waveTop?: boolean }
> = ({ children, waveBottom = true, waveTop = true }): JSX.Element => (
  <>
    {waveTop && <WaveWrapper wave='content-top' />}
    <Box
      bg='valhalla'
      opacity={0.9}
      p={{ base: '2rem 1.5rem', xs: '4rem' }}
      w='100%'>
      <Container>{children}</Container>
    </Box>
    {waveBottom && (
      <WaveWrapper sx={{ marginBottom: '8rem' }} wave='content-bottom' />
    )}
  </>
);
