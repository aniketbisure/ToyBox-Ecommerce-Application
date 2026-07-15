import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ProfileStackNavigationProp } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const profileNav = navigation as unknown as ProfileStackNavigationProp;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const { user = null } = useSelector((state: RootState) => state.auth) || {};
  const [, setOrderCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchStats = async () => {
        try {
          const { data } = await api.get('/orders/myorders');
          setOrderCount(data.length);
        } catch (e) {
          console.log('Error fetching orders');
        }
      };
      fetchStats();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => (dispatch as AppDispatch)(logoutUser()) }
    ]);
  };

  const menuOptions = [
    { name: 'My Orders', icon: 'package-variant-closed', color: '#FFB8B8', screen: 'MyOrders' },
    { name: 'Shipping Address', icon: 'map-marker-outline', color: '#B8E1FF', screen: 'Address' },
    { name: 'Payment Methods', icon: 'credit-card-outline', color: '#D6FFB8', screen: 'Payments' },
    { name: 'My Wishlist', icon: 'heart-outline', color: '#FFB8D6', screen: 'Wishlist' },
    { name: 'My Reviews', icon: 'star-outline', color: '#FFF3B8', screen: 'Reviews' },
    { name: 'Settings', icon: 'cog-outline', color: '#E1B8FF', screen: 'Settings' },
    { name: 'Help & Support', icon: 'help-circle-outline', color: '#B8FFEB', screen: 'Support' },
  ];

  const renderOption = (option: any, index: number) => (
    <TouchableOpacity
      key={option.name + index}
      style={styles.listItem}
      onPress={() => {
        if (option.screen === 'Wishlist') {
          navigation.navigate('Main', { screen: 'WishlistTab' });
        } else if (option.screen === 'MyOrders') {
          profileNav.navigate('MyOrders');
        } else if (option.screen === 'Address') {
          profileNav.navigate('Address');
        } else if (option.screen === 'Payments') {
          profileNav.navigate('Payments');
        } else if (option.screen === 'Reviews') {
          profileNav.navigate('Reviews');
        } else if (option.screen === 'Settings') {
          profileNav.navigate('Settings');
        } else if (option.screen === 'Support') {
          profileNav.navigate('Support');
        }
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
        <Icon name={option.icon} size={22} color={colors.text} />
      </View>
      <Text style={styles.listItemText}>{option.name}</Text>
      <Icon name="chevron-right" size={20} color={colors.gray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerGreeting}>Hello, {user?.name || 'User'}</Text>
          <TouchableOpacity onPress={() => profileNav.navigate('Settings')}>
            <Icon name="cog-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Grid for Quick Actions */}
        <View style={styles.topGrid}>
            <TouchableOpacity style={styles.gridItem} onPress={() => profileNav.navigate('MyOrders')}>
              <Text style={styles.gridItemText}>Your Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem} onPress={() => profileNav.navigate('MyOrders')}>
              <Text style={styles.gridItemText}>Buy Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem} onPress={() => profileNav.navigate('EditProfile')}>
              <Text style={styles.gridItemText}>Your Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Main', { screen: 'WishlistTab' })}>
              <Text style={styles.gridItemText}>Your Wish List</Text>
            </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleLarge}>Account Settings</Text>
          {menuOptions.map(renderOption)}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ToyBox App v1.0.4</Text>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrapper: { paddingTop: insets.top, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerGreeting: { fontSize: 22, fontWeight: '400', color: COLORS.white },
  scrollContent: { paddingBottom: 50 },
  topGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 45) / 2,
    height: 48,
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridItemText: { fontSize: 14, color: colors.text, fontWeight: '400' },
  section: { padding: 20, borderBottomWidth: 4, borderBottomColor: colors.lightGray },
  sectionTitleLarge: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 15 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemText: { flex: 1, fontSize: 15, marginLeft: 15, color: colors.text },
  logoutBtn: {
    margin: 20,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  logoutBtnText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  versionText: { textAlign: 'center', color: colors.gray, fontSize: 12, marginTop: 10 },
});

export default ProfileScreen;
