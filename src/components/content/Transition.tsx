import { Container, Loader } from '@mantine/core';
import classes from './Transition.module.css';
import type { FC, JSX } from 'react';

export const Transition: FC = (): JSX.Element => (
  <Container
    bg='rgba(12, 14, 39, 0.8)'
    className={classes.container}
    mih='100vh'
    miw='100vw'
    pos='fixed'>
    <Loader left='48vw' pos='absolute' role='presentation' top='50vh' />
  </Container>
);
