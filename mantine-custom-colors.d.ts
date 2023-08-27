import type { DefaultMantineColor, Tuple } from '@mantine/core';
import type { ExtendedCustomColor } from '@styles/colors';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<
      ExtendedCustomColor | DefaultMantineColor,
      Tuple<string, 10>
    >;
  }
}
