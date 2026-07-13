import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchProducts } from '../redux/slices/productSlice';
import apiClient from '../api/apiClient';

const AdminDashboardScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await dispatch(fetchProducts());
      try {
        const [ordersRes, usersRes] = await Promise.all([
          apiClient.get('/orders'),
          apiClient.get('/users/admin/all') // Assuming this endpoint exists for admin
        ]);
        setOrderCount(ordersRes.data.length);

        // Calculate total revenue
        const revenue = ordersRes.data.reduce((acc: number, order: any) => acc + order.totalPrice, 0);
        setTotalRevenue(revenue);
        setUserCount(usersRes.data.length);
      } catch (e) {
        console.log('Error fetching dashboard stats');
      }
      setLoading(false);
    };
    loadStats();
  }, [dispatch]);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const stats = [
    { label: 'Active Orders', value: orderCount.toString(), icon: 'package-variant', color: '#FF6B6B' },
    { label: 'Total Products', value: products.length.toString(), icon: 'toy-brick-outline', color: '#FFE66D' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: 'currency-inr', color: '#4ECDC4' },
    { label: 'Total Users', value: userCount.toString(), icon: 'account-group-outline', color: '#45B7D1' },
  ];

  const adminActions = [
    { name: 'Manage Products', icon: 'plus-box-multiple', description: 'Add, edit or remove products', screen: 'AdminProducts' },
    { name: 'Banner Control', icon: 'image-multiple', description: 'Change home screen banners', screen: 'AdminBanners' },
    { name: 'Categories', icon: 'shape-outline', description: 'Organize product categories', screen: 'AdminCategories' },
    { name: 'Order Insights', icon: 'chart-box-outline', description: 'View and process user orders', screen: 'AdminOrders' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ marginRight: moderateScale(15) }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Admin Control Center</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Admin' as never, { screen: 'Settings' })}
        >
          <Icon name="cog-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: moderateScale(30) }} />
        ) : (
          <View style={styles.statsGrid}>
            {stats.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Icon name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Management Console</Text>

        {/* Actions List */}
        <View style={styles.actionsContainer}>
          {adminActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={styles.actionInfo}>
                <View style={styles.actionIconBg}>
                  <Icon name={action.icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.actionTextContent}>
                  <Text style={styles.actionName}>{action.name}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Real-time Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTitle}>System Status: Live</Text>
          </View>
          <Text style={styles.statusDesc}>Your application is currently synced with the production backend. All changes made here will reflect instantly for users.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(20),
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  greeting: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: moderateScale(12),
  },
  title: {
    ...FONTS.h1,
    fontSize: moderateScale(26),
  },
  profileBtn: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(15),
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: moderateScale(25),
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: moderateScale(15),
    borderRadius: moderateScale(20),
    marginBottom: moderateScale(15),
    ...SHADOWS.medium,
  },
  statIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  statValue: {
    ...FONTS.h2,
    fontSize: moderateScale(18),
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.gray,
    marginTop: 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: moderateScale(18),
    marginBottom: moderateScale(15),
  },
  actionsContainer: {
    gap: moderateScale(15),
    marginBottom: moderateScale(25),
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: moderateScale(18),
    borderRadius: moderateScale(20),
    ...SHADOWS.medium,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconBg: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(15),
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContent: {
    marginLeft: moderateScale(15),
    flex: 1,
  },
  actionName: {
    ...FONTS.h3,
    fontSize: moderateScale(15),
  },
  actionDesc: {
    ...FONTS.caption,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#0F1111',
    padding: moderateScale(20),
    borderRadius: moderateScale(20),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginRight: 10,
  },
  statusTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: moderateScale(14),
  },
  statusDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(12),
    lineHeight: 18,
  }
});

export default AdminDashboardScreen;
