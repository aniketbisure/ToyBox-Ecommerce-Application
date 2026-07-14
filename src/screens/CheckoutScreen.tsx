import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart } from '../redux/slices/cartSlice';

// Razorpay key — read from app config Redux state (fetched from backend)
// Falls back to test key so payment screen always renders
const getRazorpayKey = (configState: any): string => {
  return configState?.razorpayKeyId || 'rzp_test_TCuOm81OvEluht';
};
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { showToast } from '../utils/toastService';
import apiClient from '../api/apiClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CheckoutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { totalAmount, items } = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.auth.user);
  const configState = useSelector((state: RootState) => state.config);
  const razorpayKey = getRazorpayKey(configState);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');

  const StepIndicator = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepItem}>
        <View style={[styles.stepDot, styles.activeStep]}>
          <Icon name="map-marker" size={14} color={COLORS.white} />
        </View>
        <Text style={[styles.stepText, styles.activeStepText]}>Address</Text>
      </View>
      <View style={[styles.stepLine, styles.activeLine]} />
      <View style={styles.stepItem}>
        <View style={styles.stepDot}>
          <Icon name="credit-card" size={14} color={COLORS.gray} />
        </View>
        <Text style={styles.stepText}>Payment</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepItem}>
        <View style={styles.stepDot}>
          <Icon name="check-all" size={14} color={COLORS.gray} />
        </View>
        <Text style={styles.stepText}>Confirm</Text>
      </View>
    </View>
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Generate Idempotency Key
      const idempotencyKey = `ord_${user?.id}_${Date.now()}`;

      // 1. Create Pending Order on Server FIRST
      const { data: pendingOrder } = await apiClient.post('/orders', {
        idempotencyKey,
        orderItems: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress: {
          address: user?.address?.street || '123, Toy Lane',
          city: user?.address?.city || 'Mumbai',
          postalCode: user?.address?.zip || '400001',
          country: user?.address?.country || 'India'
        },
        paymentMethod: paymentMethod
      });

      if (paymentMethod === 'COD') {
        setLoading(false);
        showToast('Order Placed Successfully!', 'success');
        dispatch(clearCart());
        navigation.replace('OrderSuccess');
        return;
      }

      const options = {
        description: 'Premium Kids Toys Purchase',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: razorpayKey,
        amount: Math.round(pendingOrder.totalPrice * 100),
        order_id: pendingOrder.razorpayOrderId,
        name: 'ToyBox Store',
        prefill: {
          email: user?.email || 'test@example.com',
          contact: '9999999999',
          name: user?.name || 'Guest User'
        },
        theme: { color: COLORS.primary }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        try {
          // 2. Verify Payment on Server
          await apiClient.post('/orders/verify', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature
          });

          setLoading(false);
          showToast('Order Placed Successfully!', 'success');
          dispatch(clearCart());
          navigation.replace('OrderSuccess');
        } catch (err) {
          setLoading(false);
          Alert.alert('Payment Pending', 'Payment was successful, but verification is taking longer than expected.');
        }
      }).catch((error: any) => {
        setLoading(false);
        if (error.code !== 2) {
          Alert.alert(`Payment Error: ${error.description}`);
        }
      });
    } catch (e: any) {
      setLoading(false);
      const errorMsg = e.response?.data?.message || 'Error initiating checkout';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 0 : 10) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepIndicator />

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <Icon name="map-marker-radius" size={24} color={COLORS.primary} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{user?.name || 'Aniket'}</Text>
              <Text style={styles.addressText}>
                {user?.address
                  ? `${user.address.street}, ${user.address.city} - ${user.address.zip}`
                  : '123, Toy Lane, Silicon Valley, Mumbai - 400001'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name} x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'COD' && styles.selectedCard]}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={[styles.paymentIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
              <Icon name="truck-delivery-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentDesc}>Pay when you receive the toys</Text>
            </View>
            <Icon
              name={paymentMethod === 'COD' ? "check-circle" : "circle-outline"}
              size={24}
              color={paymentMethod === 'COD' ? COLORS.success : COLORS.gray}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'Razorpay' && styles.selectedCard]}
            onPress={() => setPaymentMethod('Razorpay')}
          >
            <View style={[styles.paymentIconContainer, { backgroundColor: COLORS.secondary + '15' }]}>
              <Icon name="credit-card-outline" size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Razorpay / Cards / UPI</Text>
              <Text style={styles.paymentDesc}>Secure online payment</Text>
            </View>
            <Icon
              name={paymentMethod === 'Razorpay' ? "check-circle" : "circle-outline"}
              size={24}
              color={paymentMethod === 'Razorpay' ? COLORS.success : COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { marginBottom: 85, paddingBottom: 25 }]}>
        <CustomButton
          title={`Pay ₹${totalAmount.toFixed(2)}`}
          onPress={handlePayment}
          loading={loading}
        />
      </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 20,
  },
  content: {
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
    paddingTop: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  stepText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeStepText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  stepLine: {
    width: 50,
    height: 3,
    backgroundColor: '#F0F0F0',
    marginHorizontal: -5,
    marginTop: -20,
    zIndex: -1,
  },
  activeLine: {
    backgroundColor: COLORS.primary + '40',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: 18,
    color: COLORS.text,
  },
  editBtn: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  addressInfo: {
    marginLeft: 15,
    flex: 1,
  },
  addressName: {
    ...FONTS.h3,
    fontSize: 16,
    marginBottom: 4,
  },
  addressText: {
    ...FONTS.caption,
    lineHeight: 18,
    color: COLORS.gray,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemName: {
    ...FONTS.body,
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  itemPrice: {
    ...FONTS.body,
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  totalLabel: {
    ...FONTS.h3,
    fontSize: 18,
  },
  totalValue: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontSize: 22,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.medium,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary + '50',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentName: {
    ...FONTS.h3,
    fontSize: 15,
    color: COLORS.text,
  },
  paymentDesc: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  footer: {
    padding: 25,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOWS.dark,
  }
});

export default CheckoutScreen;
