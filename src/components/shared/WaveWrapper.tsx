import { Flex } from '@mantine/core';
import Image from 'next/image';
import type { CSSProperties, FC } from 'react';

type Wave = 'content-bottom' | 'content-top' | 'footer-bottom' | 'footer-top';

export const WaveWrapper: FC<{ style?: CSSProperties; wave: Wave }> = ({
  style = {},
  wave,
}) => (
  <Flex
    h='10rem'
    justify='flex-start'
    lh={0}
    pos='relative'
    style={{
      overflow: 'hidden',
      ...style,
    }}
    w='100%'>
    <Image
      alt=''
      fill
      priority
      sizes='100vw'
      src={`/images/waves/${wave}-haikei.svg`}
      style={{ objectFit: 'cover' }}
    />
  </Flex>
);
