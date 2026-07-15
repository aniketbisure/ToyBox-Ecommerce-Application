import React, { useEffect, useState } from 'react';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';

import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated = false, user = null } = useSelector((state: RootState) => state.auth) || {};
  const darkMode = useSelector((state: RootState) => state.config?.settings?.darkMode ?? false);
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'main'>('splash');

  useEffect(() => {
    const init = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');

        // Wonderful splash delay
        setTimeout(() => {
          if (onboarded === null) {
            setAppState('onboarding');
          } else {
            setAppState('main');
          }
        }, 3000);
      } catch (error) {
        setAppState('main');
      }
    };
    init();
  }, []);

  const theme = darkMode
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: DARK_THEME.primary, background: DARK_THEME.background, card: DARK_THEME.card, text: DARK_THEME.text } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: LIGHT_THEME.primary, background: LIGHT_THEME.background, card: LIGHT_THEME.card, text: LIGHT_THEME.text } };

  if (appState === 'splash') return <SplashScreen />;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {appState === 'onboarding' ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={() => setAppState('main')} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
