import dynamic from 'next/dynamic';
import type { FC, JSX, PropsWithChildren } from 'react';

const DynamicFooter = dynamic(
  () => import('@components/footer').then(mod => mod.Footer),
  {
    ssr: false,
  }
);

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
    <DynamicFooter />
  </div>
);
