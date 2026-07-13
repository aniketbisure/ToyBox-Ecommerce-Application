import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor, RootState } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';
import Toast from './src/components/Toast';
import { toastRef } from './src/utils/toastService';

const MainApp = () => {
  const darkMode = useSelector((state: RootState) => state.config.settings.darkMode);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />
      <AppNavigator />
      <Toast ref={toastRef} />
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MainApp />
      </PersistGate>
    </Provider>
  );
};

export default App;
