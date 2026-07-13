import { moderateScale, scale, fontSize } from '../utils/responsive';

export const COLORS = {
  primary: '#FF6B6B', // Soft Red/Pink for kids
  secondary: '#4ECDC4', // Teal
  accent: '#FFE66D', // Yellow
  error: '#FF4757',
  success: '#2ED573',
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
};

export const LIGHT_THEME = {
  ...COLORS,
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#718096',
  gray: '#A0AEC0',
  lightGray: '#EDF2F7',
  border: '#F0F0F0',
};

export const DARK_THEME = {
  ...COLORS,
  background: '#121212',
  card: '#1E1E1E',
  text: '#F8F9FA',
  textSecondary: '#A0AEC0',
  gray: '#718096',
  lightGray: '#2D3748',
  border: '#2D2D2D',
  white: '#1E1E1E', // Overriding white for dark containers if needed, or use card
};

export const SIZES = {
  base: moderateScale(8),
  font: fontSize(14),
  radius: moderateScale(16),
  padding: moderateScale(24),
  h1: fontSize(30),
  h2: fontSize(24),
  h3: fontSize(18),
  body: fontSize(14),
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: '700' as const, color: '#2D3436' },
  h2: { fontSize: SIZES.h2, fontWeight: '700' as const, color: '#2D3436' },
  h3: { fontSize: SIZES.h3, fontWeight: '600' as const, color: '#2D3436' },
  body: { fontSize: SIZES.body, fontWeight: '400' as const, color: '#4A5568' },
  caption: { fontSize: fontSize(12), fontWeight: '400' as const, color: '#718096' },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
};
