import type { DefaultMantineColor, Tuple } from '@mantine/core';
import type { ExtendedCustomColor } from '@styles/shared/colors';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<
      ExtendedCustomColor | DefaultMantineColor,
      Tuple<string, 10>
    >;
  }
}
