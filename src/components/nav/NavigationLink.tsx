import { Anchor, rem } from '@mantine/core';
import NextLink from 'next/link';
import type { MantineTheme } from '@mantine/core';
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
    className={href === pathname ? 'active' : ''}
    component={NextLink}
    display='flex'
    href={href}
    my={variant === 'md' ? undefined : '1rem'}
    onClick={onClickCb}
    sx={({
      colors: { silver },
      fn: { smallerThan },
      spacing: { md },
      white,
    }: MantineTheme) => ({
      '&.active': {
        '&:before': {
          width: '30px',
        },
      },
      '&:before': {
        backgroundColor: white,
        bottom: rem(variant === 'md' ? -10 : 8),
        content: "''",
        height: '2px',
        position: 'absolute',
        transition: 'all 0.2s',
        width: 0,
      },
      '&:hover': {
        '&:before': {
          width: '30px',
        },
        color: silver[4],
        textDecoration: 'none',
        transition: 'all 0.2s',
      },
      alignItems: 'center',
      color: white,
      fontSize: variant === 'md' ? rem(14) : 'sm',
      fontWeight: 600,
      height: '100%',
      [smallerThan('sm')]: {
        alignItems: 'center',
        display: 'flex',
        height: rem(42),
        width: '100%',
      },
      paddingLeft: md,
      paddingRight: md,
      textDecoration: 'none',
      textTransform: 'uppercase',
    })}>
    {children}
  </Anchor>
);
