import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';

const MyOrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await apiClient.get('/orders/myorders');
      setOrders(response.data);
    } catch (error) {
      console.log('Error fetching orders:', error);
      showToast('Failed to load your orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatusTimeline = ({ delivered }: { delivered: boolean }) => (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.timelineText}>Placed</Text>
      </View>
      <View style={[styles.timelineLine, { backgroundColor: COLORS.success }]} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.timelineText}>Packed</Text>
      </View>
      <View style={[styles.timelineLine, { backgroundColor: delivered ? COLORS.success : COLORS.lightGray }]} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: delivered ? COLORS.success : COLORS.lightGray }]} />
        <Text style={styles.timelineText}>Shipped</Text>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: any) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 8).toUpperCase()}</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.isDelivered ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={[styles.statusText, { color: item.isDelivered ? '#2E7D32' : '#EF6C00' }]}>
            {item.isDelivered ? 'Delivered' : 'Processing'}
          </Text>
        </View>
      </View>

      <StatusTimeline delivered={item.isDelivered} />

      <View style={styles.divider} />

      <View style={styles.itemsContainer}>
        {item.orderItems.map((prod: any, index: number) => (
          <View key={index} style={styles.productRow}>
            <Image source={{ uri: prod.image }} style={styles.productThumb} />
            <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>
            <Text style={styles.productQty}>x{prod.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total Amount: ₹{item.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant" size={80} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('HomeTab')}
              >
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
    ...SHADOWS.light,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    ...FONTS.h3,
    fontSize: moderateScale(14),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  timelineItem: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  timelineText: {
    ...FONTS.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    marginTop: -12,
    marginHorizontal: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...FONTS.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  itemsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productThumb: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },
  productName: {
    flex: 1,
    marginLeft: 10,
    ...FONTS.body,
    fontSize: 12,
  },
  productQty: {
    ...FONTS.caption,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
  },
  dateText: {
    ...FONTS.caption,
    color: COLORS.gray,
  },
  totalText: {
    ...FONTS.h3,
    fontSize: 14,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.gray,
    marginTop: 15,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  shopBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  }
});

export default MyOrdersScreen;
