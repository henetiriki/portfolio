import { Anchor } from '@mantine/core';
import NextLink from 'next/link';
import classes from './NavigationLink.module.css';
import type { FC, PropsWithChildren } from 'react';

export const NavigationLink: FC<
  {
    href: string;
    onClickCb: () => void;
    pathname: string;
    variant?: 'sm' | 'md';
  } & PropsWithChildren
> = ({ children, href, onClickCb, pathname, variant = 'md' }) => (
  <Anchor
    className={`${classes.link} ${variant === 'sm' ? classes.sm : ''} ${href === pathname ? classes.active : ''}`.trim()}
    component={NextLink}
    display='flex'
    href={href}
    my={variant === 'md' ? undefined : '1rem'}
    onClick={onClickCb}>
    {children}
  </Anchor>
);
