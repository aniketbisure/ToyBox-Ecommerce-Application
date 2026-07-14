import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';
import { useTheme } from '../hooks/useTheme';
import { Order } from '../types';

const AdminOrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (orderId: string, currentStatus: boolean) => {
    Alert.alert(
      'Update Status',
      `Mark this order as ${currentStatus ? 'Pending' : 'Delivered'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await apiClient.put(`/orders/${orderId}/deliver`);
              showToast('Order status updated', 'success');
              fetchOrders();
            } catch (error) {
              showToast('Update failed', 'error');
            }
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.isDelivered ? (colors.isDarkMode ? '#1B5E20' : '#E8F5E9') : (colors.isDarkMode ? '#E65100' : '#FFF3E0') }]}>
          <Text style={[styles.statusText, { color: item.isDelivered ? (colors.isDarkMode ? '#81C784' : '#2E7D32') : (colors.isDarkMode ? '#FFB74D' : '#EF6C00') }]}>
            {item.isDelivered ? 'Delivered' : 'Processing'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.orderBody}>
        <Text style={styles.userText}>{item.user?.name || 'User'}</Text>
        <Text style={styles.totalText}>₹{item.totalPrice}</Text>
      </View>

      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={() => handleUpdateStatus(item._id, item.isDelivered)}
      >
        <Text style={styles.detailsBtnText}>Update Delivery Status</Text>
        <Icon name="chevron-right" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-outline" size={60} color={colors.lightGray} />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(15),
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: moderateScale(20),
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
    ...SHADOWS.light,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    ...FONTS.h3,
    fontSize: moderateScale(14),
    color: colors.text,
  },
  orderDate: {
    ...FONTS.caption,
    color: colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...FONTS.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 12,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userText: {
    ...FONTS.body,
    fontSize: moderateScale(14),
    color: colors.text,
  },
  totalText: {
    ...FONTS.h3,
    color: colors.primary,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailsBtnText: {
    ...FONTS.caption,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONTS.body,
    color: colors.gray,
    marginTop: 10,
  }
});

export default AdminOrdersScreen;
