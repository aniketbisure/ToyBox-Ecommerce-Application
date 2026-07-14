import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';

export const useTheme = () => {
  const isDarkMode = useSelector((state: RootState) => state.config?.settings?.darkMode ?? false);
  const colors = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return {
    isDarkMode,
    colors,
  };
};
