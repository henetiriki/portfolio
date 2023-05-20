import { Row } from '@nextui-org/react';
import Image from 'next/legacy/image';
import { waveWrapper } from '@styles/shared';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>
    <Row css={waveWrapper}>
      <Image
        alt=''
        layout='fill'
        objectFit='cover'
        priority
        src='/images/waves/content-top-haikei.svg'
      />
    </Row>
    {children}
    <Row css={{ ...waveWrapper, mb: '8rem' }}>
      <Image
        alt=''
        layout='fill'
        objectFit='cover'
        priority
        src='/images/waves/content-bottom-haikei.svg'
      />
    </Row>
  </>
);
