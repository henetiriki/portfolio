import { Anchor, Container, Text } from '@mantine/core';
import { format } from 'date-fns';
import { useState } from 'react';
import { footerCopyright } from '@styles/footer';
import type { FC, JSX } from 'react';

export const Copyright: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());

  return (
    <Container
      sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
      <Text sx={{ marginBottom: '0.75rem' }}>
        © 2014 - {format(date, 'yyyy')}{' '}
        <Anchor
          href='https://github.com/henetiriki'
          rel='noopener noreferrer'
          sx={footerCopyright}
          target='_blank'>
          @henetiriki
        </Anchor>
      </Text>
    </Container>
  );
};
