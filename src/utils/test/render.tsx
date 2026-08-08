import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { theme } from '@styles';
import type { RenderOptions } from '@testing-library/react';
import type { FC, PropsWithChildren, ReactElement } from 'react';

const AllProviders: FC<PropsWithChildren> = ({ children }) => (
  <MantineProvider defaultColorScheme='dark' theme={theme}>
    {children}
  </MantineProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

/* eslint-disable import/export -- intentionally shadowing RTL's `render` */
export * from '@testing-library/react';
export { customRender as render };
