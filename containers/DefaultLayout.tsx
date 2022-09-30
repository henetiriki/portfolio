import { FC, PropsWithChildren } from 'react';
import { Footer } from '@components';

export const DefaultLayout: FC<PropsWithChildren> = ({
  children,
}): JSX.Element => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
    <main
      style={{
        flex: 1,
        overflow: 'auto',
      }}>
      {children}
    </main>
    <Footer />
  </div>
);
