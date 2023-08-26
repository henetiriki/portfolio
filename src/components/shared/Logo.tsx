import { Tooltip } from '@mantine/core';
import Image from 'next/legacy/image';
import Link from 'next/link';
import type { FC, JSX } from 'react';

export const Logo: FC = (): JSX.Element => (
  <Tooltip color='blackRussian.6' label={'Ouwl'}>
    <Link href={'/'}>
      <Image
        alt='Ouwl'
        height={40}
        priority
        src='/images/ouwl.png'
        width={40}
      />
    </Link>
  </Tooltip>
);
