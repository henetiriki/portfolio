import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';
import type { ExtendedCustomColor } from '@styles/colors';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<
      ExtendedCustomColor | DefaultMantineColor,
      MantineColorsTuple
    >;
  }
}
