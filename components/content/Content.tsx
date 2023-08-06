import { WaveWrapper } from '@components/shared';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>
    <WaveWrapper wave='content-top' />
    {children}
    <WaveWrapper sx={{ marginBottom: '8rem' }} wave='content-bottom' />
  </>
);
