import { FC, PropsWithChildren, RefObject } from 'react';
import { Footer } from '@components/footer';

export const Layout: FC<
  PropsWithChildren & { pageTopRef: RefObject<HTMLDivElement> | undefined }
> = ({ children, pageTopRef }): JSX.Element => (
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
    <Footer pageTopRef={pageTopRef} />
  </div>
);
