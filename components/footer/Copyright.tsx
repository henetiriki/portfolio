import { Container, Link, Text } from '@nextui-org/react';
import { format } from 'date-fns';
import { useState } from 'react';
import { footerCopyright } from '@styles/footer';
import type { FC, JSX } from 'react';

export const Copyright: FC = (): JSX.Element => {
  const [date] = useState<Date>(new Date());

  return (
    <Container css={{ d: 'flex', fd: 'row', jc: 'center' }}>
      <Text css={{ mb: '$xs' }}>
        © 2014 - {format(date, 'yyyy')}{' '}
        <Link
          css={footerCopyright}
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
