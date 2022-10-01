import { Row } from '@nextui-org/react';
import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';
import { contentWrapper, waveWrapper } from '@styles';

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>
    <Row css={waveWrapper}>
      <Image
        alt=''
        layout='fill'
        objectFit='cover'
        src='/images/waves/content-top-haikei.svg'
      />
    </Row>
    <Row css={contentWrapper}>{children}</Row>
    <Row css={{ ...waveWrapper, mb: '8rem' }}>
      <Image
        alt=''
        layout='fill'
        objectFit='cover'
        src='/images/waves/content-bottom-haikei.svg'
      />
    </Row>
  </>
);
