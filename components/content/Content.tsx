import { Row } from '@nextui-org/react';
import Image from 'next/image';
import { contentWrapper } from '@styles/content';
import { waveWrapper } from '@styles/shared';
import type { FC, PropsWithChildren } from 'react';

export const Content: FC<
  PropsWithChildren<{ wrapperPadding?: { [key: string]: string } }>
> = ({ children, wrapperPadding = {} }): JSX.Element => (
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
    <Row css={{ ...contentWrapper, ...wrapperPadding }}>{children}</Row>
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
