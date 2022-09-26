import { Container } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';

export const Content: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    as='div'
    css={{
      backgroundColor: '$valhalla',
      marginBottom: '8rem',
      padding: '4rem 0',
      /* eslint-disable sort-keys/sort-keys-fix */
      '@xs': {
        borderRadius: '$xl',
        padding: '8rem 4rem',
      },
      /* eslint-enable sort-keys/sort-keys-fix */
    }}>
    {children}
  </Container>
);
