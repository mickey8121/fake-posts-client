import type { ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows = {
  card: {
    boxShadow: [
      { offsetX: 0, offsetY: 2, blurRadius: 8, color: colors.shadow },
    ],
  },
  button: {
    boxShadow: [
      { offsetX: 0, offsetY: 1, blurRadius: 4, color: colors.shadow },
    ],
  },
} satisfies Record<string, ViewStyle>;
