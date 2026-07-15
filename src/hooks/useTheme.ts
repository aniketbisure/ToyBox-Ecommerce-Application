import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { LIGHT_THEME, DARK_THEME, ThemeColors } from '../constants/theme';

export const useTheme = () => {
  const isDarkMode = useSelector((state: RootState) => state.config?.settings?.darkMode ?? false);
  const colors = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return {
    isDarkMode,
    colors,
  };
};

/**
 * A hook that takes a style factory and returns themed styles that automatically update
 * when the theme changes.
 *
 * @param stylesFactory A function that returns a stylesheet. It receives (colors, isDarkMode, ...deps)
 * @param deps Optional additional dependencies for the styles (e.g., insets)
 */
export const useThemedStyles = <T, D extends any[]>(
  stylesFactory: (colors: ThemeColors, isDarkMode: boolean, ...args: D) => T,
  deps: D = [] as any
) => {
  const { colors, isDarkMode } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => stylesFactory(colors, isDarkMode, ...deps), [colors, isDarkMode, ...deps]);
};
