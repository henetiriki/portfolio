import { Container, Text } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
// @ts-ignore
import { Fade } from 'react-reveal';

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    css={{
      alignItems: 'center',
      display: 'flex',
      height: '50vh',
      justifyContent: 'center',
    }}>
    <Fade top>
      <Text
        as='h1'
        css={{
          span: {
            display: 'block',
            fontSize: '1.25rem',
            fontWeight: '$normal',
            letterSpacing: '$normal',
            textTransform: 'none',
          },
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
        {children}
      </Text>
    </Fade>
  </Container>
);
