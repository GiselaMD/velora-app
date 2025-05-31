import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screenDimensions = {
  width,
  height,
  isSmallScreen: width < 375,
  isLargeScreen: width > 414,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;