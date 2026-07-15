import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { showToast } from '../utils/toastService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { getProfile } from '../redux/slices/authSlice';
import apiClient from '../api/apiClient';

interface Card {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  type: string;
}

const PaymentMethodsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [cards, setCards] = useState<Card[]>(user?.paymentMethods || []);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    if (user?.paymentMethods) {
      setCards(user.paymentMethods);
    }
  }, [user?.paymentMethods]);

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.holder || !newCard.expiry || !newCard.cvv) {
      showToast('Please fill all details', 'error');
      return;
    }

    if (newCard.number.length < 16) {
      showToast('Invalid card number', 'error');
      return;
    }

    setLoading(true);
    try {
      const card: Card = {
        id: Math.random().toString(36).substr(2, 9),
        number: `**** **** **** ${newCard.number.slice(-4)}`,
        holder: newCard.holder,
        expiry: newCard.expiry,
        type: newCard.number.startsWith('4') ? 'visa' : 'mastercard',
      };

      const updatedCards = [...cards, card];
      await apiClient.put('/users/profile', { paymentMethods: updatedCards });
      dispatch(getProfile());

      setNewCard({ number: '', holder: '', expiry: '', cvv: '' });
      setShowModal(false);
      showToast('Card added successfully', 'success');
    } catch (e) {
      showToast('Failed to save card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = (id: string) => {
    Alert.alert('Remove Card', 'Are you sure you want to remove this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedCards = cards.filter((c) => c.id !== id);
            await apiClient.put('/users/profile', { paymentMethods: updatedCards });
            dispatch(getProfile());
            showToast('Card removed', 'info');
          } catch (e) {
            showToast('Failed to remove card', 'error');
          }
        },
      },
    ]);
  };

  const renderCard = ({ item }: { item: Card }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardInfo}>
        <View style={[styles.cardIcon, { backgroundColor: item.type === 'visa' ? '#1A1F71' : '#EB001B' }]}>
          <Icon name={item.type === 'visa' ? 'visa' : 'mastercard'} size={24} color="#FFF" />
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.cardNumber}>{item.number}</Text>
          <Text style={styles.cardHolder}>{item.holder.toUpperCase()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteCard(item.id)}>
        <Icon name="trash-can-outline" size={22} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.backBtn}>
          <Icon name="plus" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="credit-card-plus-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>No Saved Cards</Text>
            <Text style={styles.emptySubtitle}>
              You haven't saved any payment methods yet. You can add them here for faster checkout.
            </Text>

            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ Add New Card</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          cards.length > 0 ? (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Secure Payments</Text>
              <View style={styles.infoRow}>
                <Icon name="shield-check" size={20} color={COLORS.success} />
                <Text style={styles.infoText}>Your payment information is encrypted and secure.</Text>
              </View>
            </View>
          ) : null
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.gray}
                  keyboardType="numeric"
                  maxLength={16}
                  value={newCard.number}
                  onChangeText={(t) => setNewCard({ ...newCard, number: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Holder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.gray}
                  autoCapitalize="characters"
                  value={newCard.holder}
                  onChangeText={(t) => setNewCard({ ...newCard, holder: t })}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={[styles.inputGroup, { width: '48%' }]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.gray}
                    maxLength={5}
                    value={newCard.expiry}
                    onChangeText={(t) => setNewCard({ ...newCard, expiry: t })}
                  />
                </View>
                <View style={[styles.inputGroup, { width: '48%' }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.gray}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    value={newCard.cvv}
                    onChangeText={(t) => setNewCard({ ...newCard, cvv: t })}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Card</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
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
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: colors.card,
    ...SHADOWS.light,
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 40, height: 25, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  cardNumber: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardHolder: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyTitle: { ...FONTS.h2, marginTop: 20, color: colors.text },
  emptySubtitle: { ...FONTS.body, textAlign: 'center', color: COLORS.gray, marginTop: 10, lineHeight: 22 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 30 },
  addBtnText: { color: COLORS.white, fontWeight: '700' },
  infoSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.lightGray, paddingTop: 20 },
  infoTitle: { ...FONTS.h3, marginBottom: 10, color: colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 10, ...FONTS.body, fontSize: 13, color: COLORS.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '80%', backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...FONTS.h2, fontSize: 18, color: colors.text },
  inputGroup: { marginBottom: 20 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 8, fontSize: 14, color: colors.text },
  input: { borderRadius: 12, paddingHorizontal: 15, height: 50, ...FONTS.body, borderWidth: 1, borderColor: colors.lightGray, backgroundColor: colors.card, color: colors.text },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  saveBtnText: { ...FONTS.h3, color: COLORS.white },
});

export default PaymentMethodsScreen;
