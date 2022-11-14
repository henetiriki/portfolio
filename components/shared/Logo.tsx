import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

export const Logo: FC = (): JSX.Element => (
  <Link href={'/'}>
    <a>
      <Image
        alt='Ouwl'
        height={40}
        priority
        src='/images/ouwl.png'
        width={40}
      />
    </a>
  </Link>
);
