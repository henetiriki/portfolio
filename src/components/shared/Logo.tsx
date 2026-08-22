import { Tooltip } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import type { FC, JSX } from 'react';

export const Logo: FC = (): JSX.Element => (
  <Tooltip color='black-russian.6' label={'Ouwl'}>
    <Link href={'/'}>
      <Image
        alt='Ouwl.house — home'
        height={40}
        src='/images/ouwl.png'
        width={40}
      />
    </Link>
  </Tooltip>
);
