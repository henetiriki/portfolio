import { Row, styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
import { contentWrapper, waveImg, waveWrapper } from '@styles';

const WaveImg = styled('img', waveImg);

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>
    <Row css={waveWrapper}>
      <WaveImg alt='' src='/images/waves/content-top-haikei.svg' />
    </Row>
    <Row css={contentWrapper}>{children}</Row>
    <Row css={{ ...waveWrapper, mb: '8rem' }}>
      <WaveImg alt='' src='/images/waves/content-bottom-haikei.svg' />
    </Row>
  </>
);
