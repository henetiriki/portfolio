import { Flex } from '@mantine/core';
import Image from 'next/image';
import type { Sx } from '@mantine/core';
import type { FC } from 'react';

type Wave = 'content-bottom' | 'content-top' | 'footer-bottom' | 'footer-top';

export const WaveWrapper: FC<{ sx?: Sx; wave: Wave }> = ({ sx = {}, wave }) => (
  <Flex
    h='15rem'
    justify='flex-start'
    lh={0}
    pos='relative'
    sx={{
      overflow: 'hidden',
      ...sx,
    }}
    w='100%'>
    <Image
      alt=''
      fill
      priority
      sizes='100vw'
      src={`/images/waves/${wave}-haikei.svg`}
      style={{
        objectFit: 'cover',
      }}
    />
  </Flex>
);
