import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/apiClient';

import { useTheme } from '../hooks/useTheme';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items ?? []);

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrderCount(data.length);
      } catch (e) {
        console.log('Error fetching profile stats');
      }
    };
    fetchStats();
    // Wishlist count comes from persisted redux state
    setWishlistCount(wishlistItems.length);
  }, [wishlistItems.length]);

  const menuOptions = [
    { name: 'My Orders', icon: 'package-variant-closed', color: '#FFB8B8', screen: 'MyOrders' },
    { name: 'Shipping Address', icon: 'map-marker-outline', color: '#B8E1FF', screen: 'Address' },
    { name: 'Payment Methods', icon: 'credit-card-outline', color: '#D6FFB8', screen: 'Payments' },
    { name: 'My Reviews', icon: 'star-outline', color: '#FFF3B8', screen: 'Reviews' },
    { name: 'Settings', icon: 'cog-outline', color: '#E1B8FF', screen: 'Settings' },
  ];

  if (user?.role === 'admin') {
    menuOptions.unshift({ name: 'Admin Dashboard', icon: 'view-dashboard-outline', color: colors.primary, screen: 'AdminDashboard' });
  }

  const renderOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.optionItem}
      onPress={() => {
        if (option.screen === 'AdminDashboard') {
          navigation.navigate('Admin' as never);
        } else if (option.screen === 'MyOrders') {
          navigation.navigate('MyOrders' as never);
        } else if (option.screen === 'Address') {
          navigation.navigate('Address' as never);
        } else if (option.screen === 'Payments') {
          navigation.navigate('Payments' as never);
        } else if (option.screen === 'Reviews') {
          navigation.navigate('Reviews' as never);
        } else if (option.screen === 'Settings') {
          navigation.navigate('Settings' as never);
        } else {
          showToast(`${option.name} feature is coming soon!`, 'info');
        }
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.color + '40' }]}>
        <Icon name={option.icon} size={24} color={colors.text} />
      </View>
      <Text style={[styles.optionName, { color: colors.text }]}>{option.name}</Text>
      <Icon name="chevron-right" size={24} color={colors.gray} />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of ToyBox?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            showToast('Logged out successfully', 'info');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}>

        {/* Profile Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Icon name="cog-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileMainInfo}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.defaultAvatar, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="account" size={45} color={colors.primary} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Aniket'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'aniket@example.com'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => navigation.navigate('EditProfile' as never)}
            >
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{orderCount}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{wishlistCount}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{reviewCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.menuContainer}>
            {menuOptions.slice(0, 3).map(renderOption)}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Others</Text>
          <View style={styles.menuContainer}>
            {menuOptions.slice(3).map(renderOption)}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Icon name="logout-variant" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Logout from Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.4 • Build 86</Text>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    ...FONTS.h1,
    fontSize: 26,
    color: colors.text,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  profileCard: {
    borderRadius: 25,
    padding: 20,
    backgroundColor: colors.card,
    ...SHADOWS.medium,
    marginBottom: 30,
  },
  profileMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  defaultAvatar: {
    width: 75,
    height: 75,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 25,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    ...FONTS.h2,
    fontSize: 20,
    marginBottom: 2,
    color: colors.text,
  },
  userEmail: {
    ...FONTS.caption,
    color: colors.gray,
  },
  editProfileBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editProfileText: {
    ...FONTS.body,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...FONTS.h2,
    fontSize: 20,
  },
  statLabel: {
    ...FONTS.caption,
    color: colors.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: colors.border,
  },
  menuSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 15,
    fontSize: 15,
    marginLeft: 5,
    color: colors.text,
  },
  menuContainer: {
    borderRadius: 20,
    backgroundColor: colors.card,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    flex: 1,
    ...FONTS.body,
    marginLeft: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    ...FONTS.h3,
    color: colors.error,
    marginLeft: 10,
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    ...FONTS.caption,
    color: colors.gray,
    marginBottom: 20,
  }
});

export default ProfileScreen;
