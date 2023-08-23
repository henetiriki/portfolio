import type { Tuple } from '@mantine/core';
import type { ExtendedCustomColors } from '@styles/shared/colors';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}
