import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Platform } from 'react-native';

import HomeStack from './HomeStack';
import CartStack from './CartStack';
import ProfileStack from './ProfileStack';
import WishlistScreen from '../screens/WishlistScreen';
import CategoriesScreen from '../screens/CategoriesScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'HomeTab') iconName = 'home-outline';
          else if (route.name === 'Categories') iconName = 'apps';
          else if (route.name === 'Wishlist') iconName = 'heart-outline';
          else if (route.name === 'CartTab') iconName = 'cart-outline';
          else if (route.name === 'ProfileTab') iconName = 'account-outline';

          return <Icon name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarShowLabel: true,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: COLORS.white,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...SHADOWS.dark,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ tabBarLabel: 'Categories' }}
      />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
