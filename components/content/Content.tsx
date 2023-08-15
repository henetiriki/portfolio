import { Box } from '@mantine/core';
import { WaveWrapper } from '@components/shared';
import { contentWrapper } from '@styles/content';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Content: FC<
  PropsWithChildren & { waveBottom?: boolean; waveTop?: boolean }
> = ({ children, waveBottom = true, waveTop = true }): JSX.Element => (
  <>
    {waveTop && <WaveWrapper wave='content-top' />}
    <Box sx={contentWrapper}>{children}</Box>
    {waveBottom && (
      <WaveWrapper sx={{ marginBottom: '8rem' }} wave='content-bottom' />
    )}
  </>
);
