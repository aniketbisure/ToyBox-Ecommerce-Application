import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';
import EditProductScreen from '../screens/EditProductScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';
import AdminBannersScreen from '../screens/AdminBannersScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminBanners" component={AdminBannersScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AdminStack;
