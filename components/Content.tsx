import { styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
import { contentWrapper, waveImg, waveWrapper } from '@styles';

const WaveWrapper = styled('div', waveWrapper);
const WaveImg = styled('img', waveImg);

const ContentWrapper = styled('div', contentWrapper);

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>
    <WaveWrapper>
      <WaveImg alt='' src='/images/waves/content-top-haikei.svg' />
    </WaveWrapper>
    <ContentWrapper>{children}</ContentWrapper>
    <WaveWrapper css={{ marginBottom: '8rem' }}>
      <WaveImg alt='' src='/images/waves/content-bottom-haikei.svg' />
    </WaveWrapper>
  </>
);
