import { Container, Title } from '@mantine/core';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    sx={{
      height: '50vh',
    }}>
    <Title
      order={1}
      sx={{
        paddingTop: '20%',
        span: {
          display: 'block',
          fontSize: '1.25rem',
          fontWeight: 'normal',
          letterSpacing: 'normal',
          lineHeight: '2rem',
          textTransform: 'none',
        },
        textAlign: 'center',
        textTransform: 'uppercase',
      }}>
      {children}
    </Title>
  </Container>
);
