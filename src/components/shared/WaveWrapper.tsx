import { Flex } from '@mantine/core';
import Image from 'next/image';
import type { MantineStyleProp } from '@mantine/core';
import type { FC } from 'react';

type Wave = 'content-bottom' | 'content-top' | 'footer-bottom' | 'footer-top';

export const WaveWrapper: FC<{ style?: MantineStyleProp; wave: Wave }> = ({
  style,
  wave,
}) => (
  <Flex
    justify='flex-start'
    lh={0}
    pos='relative'
    style={[
      { height: '10rem', overflow: 'hidden' },
      // Mantine merges style arrays from left to right, so caller styles can
      // override defaults without being shadowed by a shorthand `h` prop.
      style,
    ]}
    w='100%'>
    <Image
      alt=''
      fill
      sizes='100vw'
      src={`/images/waves/${wave}-haikei.svg`}
      style={{ objectFit: 'cover' }}
    />
  </Flex>
);
