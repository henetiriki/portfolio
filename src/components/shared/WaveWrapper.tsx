import { Box } from '@mantine/core';
import Image from 'next/legacy/image';
import { waveWrapper } from '@styles/shared';
import type { Sx } from '@mantine/core';
import type { FC } from 'react';

type Wave = 'content-bottom' | 'content-top' | 'footer-bottom' | 'footer-top';

export const WaveWrapper: FC<{ sx?: Sx; wave: Wave }> = ({ sx = {}, wave }) => (
  <Box sx={{ ...waveWrapper, ...sx }}>
    <Image
      alt=''
      layout='fill'
      objectFit='cover'
      priority
      src={`/images/waves/${wave}-haikei.svg`}
    />
  </Box>
);
