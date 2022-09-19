import Link from 'next/link';
import { menuItems } from '@fixtures';

export const NavItems = () => (
  <>
    {menuItems.map(({ href, text }, idx) => (
      <Link key={idx} href={href} passHref>
        <a>{text}</a>
      </Link>
    ))}
  </>
);
