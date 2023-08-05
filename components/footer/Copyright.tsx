import { Anchor, Container, Text } from '@mantine/core';
import { format } from 'date-fns';
import { useState } from 'react';
import type { FC, JSX } from 'react';

export const Copyright: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());

  return (
    <Container>
      <Text>
        © 2014 - {format(date, 'yyyy')}{' '}
        <Anchor
          href='https://github.com/henetiriki'
          rel='noopener noreferrer'
          target='_blank'>
          @henetiriki
        </Anchor>
      </Text>
    </Container>
  );
};
