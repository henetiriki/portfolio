import { Footer } from '@components/footer';
import type { FC, PropsWithChildren } from 'react';

export const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => (
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
