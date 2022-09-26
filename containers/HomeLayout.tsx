import { FC, PropsWithChildren } from 'react';
import { Footer } from '@components';

export const HomeLayout: FC<PropsWithChildren> = ({
  children,
}): JSX.Element => {
  return (
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
};
