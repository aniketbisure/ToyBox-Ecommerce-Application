import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Product } from './index';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  WishlistTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetail: { product: Product };
  Search: undefined;
};

export type CartStackParamList = {
  CartScreen: undefined;
  Checkout: undefined;
  OrderSuccess: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  MyOrders: undefined;
  Address: undefined;
  Payments: undefined;
  Reviews: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminProducts: undefined;
  EditProduct: { product: Product | null };
  AdminOrders: undefined;
  AdminBanners: undefined;
  AdminCategories: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: { screen: keyof AuthStackParamList };
  Main: { screen: keyof MainTabParamList };
  Admin: { screen: keyof AdminStackParamList };
};

export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;
export type ProfileStackNavigationProp = StackNavigationProp<ProfileStackParamList>;
