import { Flex } from '@mantine/core';
import Image from 'next/image';
import type { CSSProperties, FC } from 'react';

type Wave = 'content-bottom' | 'content-top' | 'footer-bottom' | 'footer-top';

export const WaveWrapper: FC<{ style?: CSSProperties; wave: Wave }> = ({
  style = {},
  wave,
}) => (
  <Flex
    justify='flex-start'
    lh={0}
    pos='relative'
    style={{
      // Mantine v7's style-prop resolution (getBoxStyle) always spreads
      // shorthand props (like `h`) after the `style` object, so an `h='10rem'`
      // prop here would silently win over any `height` override passed via
      // `style` below. Setting the default height inside `style` itself keeps
      // it overridable by the caller (see Footer.tsx's footer-top wave).
      height: '10rem',
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
