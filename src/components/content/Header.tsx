import { Container, Title } from '@mantine/core';
import classes from './Header.module.css';
import type { FC, JSX, PropsWithChildren } from 'react';

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <Container
    style={{
      height: '75vh',
      paddingTop: '30vh',
    }}>
    <Title className={classes.title} order={1}>
      {children}
    </Title>
  </Container>
);
