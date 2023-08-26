import { Flex } from '@mantine/core';
import type { FlexProps } from '@mantine/core';
import type { FC, PropsWithChildren } from 'react';

export const FooterLinksContainer: FC<FlexProps & PropsWithChildren> = ({
  children,
  ...others
}) => (
  <Flex
    align='center'
    columnGap='1rem'
    direction='row'
    justify='center'
    p='1.25rem 0'
    rowGap='1rem'
    wrap='wrap'
    {...others}>
    {children}
  </Flex>
);
