import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  FlatList,
  TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart, syncCart } from '../redux/slices/cartSlice';
import { setSelectedPhoneNumber, getProfile } from '../redux/slices/authSlice';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import { showToast } from '../utils/toastService';
import apiClient from '../api/apiClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { Address } from '../types';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const getRazorpayKey = (configState: any): string => {
  return configState?.razorpayKeyId || 'rzp_test_TCuOm81OvEluht';
};

const CheckoutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);

  const { totalAmount, items } = useSelector((state: RootState) => state.cart);
  const { user, selectedPhoneNumber } = useSelector((state: RootState) => state.auth);
  const configState = useSelector((state: RootState) => state.config);
  const razorpayKey = getRazorpayKey(configState);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses && user.addresses.length > 0 ? user.addresses[0] : null
  );
  const [selectedPhone, setSelectedPhone] = useState<string>(
    selectedPhoneNumber || (user?.phoneNumbers && user.phoneNumbers.length > 0 ? user.phoneNumbers[0] : '')
  );

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const handlePayment = async () => {
    if (!user?.name || !user?.email) {
      showToast('Please complete your profile (name & email) first', 'error');
      return;
    }
    if (!selectedAddress) {
      showToast('Please select a shipping address', 'error');
      return;
    }
    if (!selectedPhone || selectedPhone.length < 10) {
      showToast('Please provide a valid contact number', 'error');
      return;
    }
    if (!paymentMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data: pendingOrder } = await apiClient.post('/orders', {
        orderItems: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress: {
          address: selectedAddress.street,
          city: selectedAddress.city,
          postalCode: selectedAddress.zip,
          country: selectedAddress.country || 'India'
        },
        paymentMethod: paymentMethod,
        contactNumber: selectedPhone
      });

      if (paymentMethod === 'COD') {
        finalizeOrder();
        return;
      }

      const options = {
        description: 'Quality Toys from ToyBox',
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
        currency: 'INR',
        key: razorpayKey,
        amount: Math.round(pendingOrder.totalPrice * 100).toString(),
        order_id: pendingOrder.razorpayOrderId,
        name: 'ToyBox Store',
        prefill: {
          email: user?.email || '',
          contact: selectedPhone,
          name: user?.name || ''
        },
        theme: { color: COLORS.primary }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        try {
          await apiClient.post('/orders/verify', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature
          });
          finalizeOrder();
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

  const finalizeOrder = () => {
    setLoading(false);
    showToast('Order Placed Successfully!', 'success');
    dispatch(clearCart());
    if (user) dispatch(syncCart([]) as any);
    navigation.replace('OrderSuccess');
  };

  const handleAddNewPhone = async () => {
    if (!newPhone || newPhone.length < 10) {
      showToast('Enter valid phone number', 'error');
      return;
    }
    const updatedPhones = [...(user?.phoneNumbers || []), newPhone];
    try {
      await apiClient.put('/users/profile', { phoneNumbers: updatedPhones });
      await dispatch(getProfile() as any);
      setSelectedPhone(newPhone);
      setShowPhoneModal(false);
      setNewPhone('');
      showToast('Phone number added', 'success');
    } catch (e) {
      showToast('Failed to add phone', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={styles.editBtn}>Change</Text>
            </TouchableOpacity>
          </View>
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <Icon name="map-marker-radius" size={24} color={COLORS.primary} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{selectedAddress.label || 'Default Address'}</Text>
                <Text style={styles.addressText}>
                  {`${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.zip}`}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.noAddressCard} onPress={() => navigation.navigate('ProfileTab', { screen: 'Address' })}>
              <Icon name="plus-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.noAddressText}>Add a shipping address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Number</Text>
            <TouchableOpacity onPress={() => setShowPhoneModal(true)}>
              <Text style={styles.editBtn}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactCard}>
            <Icon name="phone-outline" size={22} color={COLORS.secondary} />
            <Text style={styles.contactText}>{selectedPhone || 'Select a phone number'}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name} x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={[styles.paymentCard, paymentMethod === 'COD' && styles.selectedCard]} onPress={() => setPaymentMethod('COD')}>
            <Icon name="truck-delivery-outline" size={24} color={COLORS.primary} />
            <Text style={styles.paymentName}>Cash on Delivery</Text>
            <Icon name={paymentMethod === 'COD' ? "check-circle" : "circle-outline"} size={22} color={paymentMethod === 'COD' ? COLORS.success : colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.paymentCard, paymentMethod === 'Razorpay' && styles.selectedCard]} onPress={() => setPaymentMethod('Razorpay')}>
            <Icon name="credit-card-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.paymentName}>Razorpay / UPI / Cards</Text>
            <Icon name={paymentMethod === 'Razorpay' ? "check-circle" : "circle-outline"} size={22} color={paymentMethod === 'Razorpay' ? COLORS.success : colors.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title={`Place Order • ₹${totalAmount.toLocaleString()}`} onPress={handlePayment} loading={loading} />
      </View>

      {/* Address Selection Modal */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}><Icon name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={user?.addresses || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.selectCard, selectedAddress?.id === item.id && styles.activeSelect]}
                  onPress={() => { setSelectedAddress(item); setShowAddressModal(false); }}
                >
                  <Text style={styles.selectLabel}>{item.label || 'Other'}</Text>
                  <Text style={styles.selectText}>{item.street}, {item.city}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity style={styles.addSelectBtn} onPress={() => { setShowAddressModal(false); navigation.navigate('ProfileTab', { screen: 'Address' }); }}>
                  <Text style={styles.addSelectText}>+ Add New Address</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Phone Selection Modal */}
      <Modal visible={showPhoneModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Phone Number</Text>
              <TouchableOpacity onPress={() => setShowPhoneModal(false)}><Icon name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={user?.phoneNumbers || []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.selectCard, selectedPhone === item && styles.activeSelect]}
                  onPress={() => {
                    setSelectedPhone(item);
                    dispatch(setSelectedPhoneNumber(item));
                    setShowPhoneModal(false);
                  }}
                >
                  <Text style={styles.selectText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <View style={styles.addPhoneRow}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Add new phone..."
                    placeholderTextColor={colors.gray}
                    keyboardType="numeric"
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />
                  <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddNewPhone}>
                    <Text style={styles.addSmallText}>Add</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  content: { paddingBottom: 50 },
  section: {
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    backgroundColor: colors.card,
    borderBottomColor: colors.lightGray
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  editBtn: { color: COLORS.secondary, fontWeight: '700' },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 15,
    backgroundColor: colors.lightGray
  },
  addressInfo: { marginLeft: 12, flex: 1 },
  addressLabel: { fontWeight: '700', fontSize: 14, marginBottom: 4, color: colors.text },
  addressText: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  noAddressCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 12 },
  noAddressText: { color: COLORS.primary, fontWeight: '700', marginLeft: 10 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    backgroundColor: colors.lightGray
  },
  contactText: { marginLeft: 10, fontWeight: '600', color: colors.text },
  summaryCard: { borderRadius: 12, padding: 15, backgroundColor: colors.lightGray },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 13, flex: 1, color: colors.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '600', color: colors.text },
  divider: { height: 1, marginVertical: 10, backgroundColor: colors.gray + '50' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 18, color: COLORS.primary, fontWeight: '800' },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.lightGray
  },
  selectedCard: { borderColor: COLORS.primary, borderWidth: 1 },
  paymentName: { flex: 1, marginLeft: 15, fontWeight: '600', color: colors.text },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: colors.card,
    borderTopColor: colors.lightGray,
    paddingBottom: Math.max(insets.bottom, 20),
    ...SHADOWS.dark
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '70%',
    backgroundColor: colors.card
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  selectCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.lightGray
  },
  activeSelect: { borderColor: COLORS.primary, borderWidth: 1 },
  selectLabel: { fontWeight: '700', marginBottom: 4, color: colors.text },
  selectText: { color: colors.textSecondary },
  addSelectBtn: { padding: 15, alignItems: 'center' },
  addSelectText: { color: COLORS.primary, fontWeight: '700' },
  addPhoneRow: { flexDirection: 'row', marginTop: 10 },
  phoneInput: {
    flex: 1,
    height: 50,
    borderBottomWidth: 1,
    borderColor: colors.gray,
    color: colors.text
  },
  addSmallBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10, marginLeft: 10 },
  addSmallText: { color: '#FFF', fontWeight: '700' }
});

export default CheckoutScreen;
