import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';
import { useTheme } from '../hooks/useTheme';
import { Order } from '../types';

const MyOrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [orders, setOrders] = useState<Order[]>([]);
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

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.put(`/orders/${orderId}/cancel`);
              showToast('Order cancelled', 'success');
              fetchMyOrders();
            } catch (error) {
              showToast('Failed to cancel order', 'error');
            }
          }
        }
      ]
    );
  };

  const StatusTimeline = ({ delivered }: { delivered: boolean }) => (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
        <Text style={styles.timelineText}>Placed</Text>
      </View>
      <View style={[styles.timelineLine, { backgroundColor: colors.success }]} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
        <Text style={styles.timelineText}>Packed</Text>
      </View>
      <View style={[styles.timelineLine, { backgroundColor: delivered ? colors.success : colors.lightGray }]} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: delivered ? colors.success : colors.lightGray }]} />
        <Text style={styles.timelineText}>Shipped</Text>
      </View>
    </View>
  );

  const handleBuyAgain = (item: Order) => {
    item.orderItems.forEach(prod => {
      dispatch({ type: 'cart/addToCart', payload: {
        id: prod.product,
        name: prod.name,
        price: prod.price,
        image: prod.image,
        quantity: prod.quantity
      }});
    });
    showToast('Items added to cart', 'success');
    navigation.navigate('CartTab');
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 8).toUpperCase()}</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.isDelivered ? (colors.isDarkMode ? '#1B5E20' : '#E8F5E9') : (colors.isDarkMode ? '#E65100' : '#FFF3E0') }]}>
          <Text style={[styles.statusText, { color: item.isDelivered ? (colors.isDarkMode ? '#81C784' : '#2E7D32') : (colors.isDarkMode ? '#FFB74D' : '#EF6C00') }]}>
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

      <View style={styles.divider} />

      {/* Shipping Details Section */}
      <View style={styles.shippingSection}>
        <View style={styles.shippingHeader}>
          <Text style={styles.shippingTitle}>Shipping Address</Text>
        </View>
        <Text style={styles.shippingText}>
          {item.shippingAddress.address}, {item.shippingAddress.city} - {item.shippingAddress.postalCode}
        </Text>
        {item.contactNumber && <Text style={styles.shippingText}>Phone: {item.contactNumber}</Text>}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalText}>Total Amount: ₹{item.totalPrice.toFixed(2)}</Text>
          <TouchableOpacity style={{marginTop: 5}} onPress={() => handleBuyAgain(item)}>
            <Text style={styles.buyAgainBtn}>Buy Again</Text>
          </TouchableOpacity>
        </View>
        {!item.isDelivered && (
          <TouchableOpacity onPress={() => handleCancelOrder(item._id)}>
            <Text style={styles.cancelText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
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
              <Icon name="package-variant" size={80} color={colors.lightGray} />
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    ...FONTS.h3,
    fontSize: moderateScale(14),
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
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
    color: colors.text,
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
    backgroundColor: colors.lightGray,
  },
  productName: {
    flex: 1,
    marginLeft: 10,
    ...FONTS.body,
    fontSize: 12,
    color: colors.text,
  },
  productQty: {
    ...FONTS.caption,
    marginLeft: 10,
    color: colors.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
    alignItems: 'center',
  },
  dateText: {
    ...FONTS.caption,
    color: colors.gray,
  },
  totalText: {
    ...FONTS.h3,
    fontSize: 14,
    color: colors.primary,
  },
  buyAgainBtn: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  shippingSection: {
    marginBottom: 12,
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shippingTitle: {
    ...FONTS.h4,
    fontSize: 12,
    color: colors.text,
  },
  shippingText: {
    ...FONTS.body,
    fontSize: 11,
    color: colors.gray,
  },
  editBtn: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONTS.body,
    color: colors.gray,
    marginTop: 15,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  shopBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...FONTS.h2,
    fontSize: 18,
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    ...FONTS.body,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.text,
  },
  updateBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  updateBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  }
});

export default MyOrdersScreen;
