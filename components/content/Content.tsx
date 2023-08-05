import { Container } from '@mantine/core';
import Image from 'next/legacy/image';
import { useWaveWrapperStyles } from '@styles/shared';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const {
    classes: { waveWrapper, waveWrapperBottom },
    cx,
  } = useWaveWrapperStyles();

  return (
    <>
      <Container className={waveWrapper}>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/content-top-haikei.svg'
        />
      </Container>
      {children}
      <Container className={cx(waveWrapper, waveWrapperBottom)}>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          priority
          src='/images/waves/content-bottom-haikei.svg'
        />
      </Container>
    </>
  );
};
