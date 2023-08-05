import { Container, Title, createStyles } from '@mantine/core';
import type { FC, JSX, PropsWithChildren } from 'react';

const useHeaderStyles = createStyles({
  h1: {
    '& span': {
      display: 'block',
      fontSize: '1.25rem',
      fontWeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
    },
    textTransform: 'uppercase',
  },
  headerWrapper: {
    alignItems: 'center',
    display: 'flex',
    height: '50vh',
  },
});

export const Header: FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const {
    classes: { h1, headerWrapper },
  } = useHeaderStyles();

  return (
    <Container className={headerWrapper}>
      <Title align='center' className={h1} order={1}>
        {children}
      </Title>
    </Container>
  );
};
