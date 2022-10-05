import { Row } from '@nextui-org/react';
import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';
import { contentWrapper } from '@styles/content';
import { waveWrapper } from '@styles/shared';

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
    <Row css={contentWrapper}>{children}</Row>
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
