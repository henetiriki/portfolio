import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Logo = () => (
  <Link href={'/'}>
    <a>
      <Image
        priority
        src='/images/ouwl.png'
        width={40}
        height={40}
        alt='Ouwl'
      />
    </a>
  </Link>
);

export default Logo;
