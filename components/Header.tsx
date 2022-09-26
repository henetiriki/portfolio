import { Container, Text } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    css={{
      alignItems: 'center',
      display: 'flex',
      height: '50vh',
      justifyContent: 'center',
    }}>
    <Text
      as='h1'
      css={{
        span: { display: 'block', fontSize: '2rem', fontWeight: '$normal' },
        textAlign: 'center',
      }}>
      {children}
    </Text>
  </Container>
);
