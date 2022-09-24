import { Container, Link, Text } from '@nextui-org/react';
import { format } from 'date-fns';
import { FC, useState } from 'react';

export const Copyright: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());

  return (
    <Container
      css={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
      <Text>
        © 2014 - {format(date, 'yyyy')}{' '}
        <Link
          css={{
            color: '$shamrock',
          }}
          href='https://github.com/henetiriki'
          isExternal
          rel='noopener noreferrer'
          target='_blank'>
          @henetiriki
        </Link>
      </Text>
    </Container>
  );
};
