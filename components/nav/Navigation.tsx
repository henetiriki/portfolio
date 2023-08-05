import { NavLink } from '@mantine/core';
import { menuItems } from '@fixtures/nav';
import type { FC, JSX } from 'react';

export const Navigation: FC = (): JSX.Element => (
  <div>
    {menuItems.map(({ href, text }, idx) => (
      <NavLink component='a' href={href} key={idx}>
        {text}
      </NavLink>
    ))}
  </div>
);
