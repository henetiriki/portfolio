import Image from 'next/legacy/image';
import Link from 'next/link';
import type { FC, JSX } from 'react';

export const Logo: FC = (): JSX.Element => (
  <Link href={'/'} title='Ouwl'>
    <Image alt='Ouwl' height={40} priority src='/images/ouwl.png' width={40} />
  </Link>
);
