import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest')
);

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    ScreenContainer: View,
    Screen: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
  };
});

// Mock react-native-vector-icons/MaterialCommunityIcons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-razorpay
jest.mock('react-native-razorpay', () => ({
  open: jest.fn(),
}));
