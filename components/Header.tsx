import { Container, Text } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    css={{
      dflex: 'center',
      h: '50vh',
    }}>
    <Text
      css={{
        fontFamily: '$sansHeading',
        span: {
          d: 'block',
          fontWeight: '$normal',
          fs: '1.25rem',
          letterSpacing: '$normal',
          tt: 'none',
        },
        ta: 'center',
        tt: 'uppercase',
      }}
      h1>
      {children}
    </Text>
  </Container>
);
