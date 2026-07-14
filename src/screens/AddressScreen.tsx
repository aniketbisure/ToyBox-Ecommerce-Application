import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { getProfile } from '../redux/slices/authSlice';
import apiClient from '../api/apiClient';
import { useTheme } from '../hooks/useTheme';
import { Address } from '../types';

const AddressScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({ label: '', street: '', city: '', state: '', zip: '', country: 'India' });
    setShowModal(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label || '',
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || 'India'
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.street || !formData.city || !formData.zip) {
      showToast('Please fill in required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      let updatedAddresses = [...(user?.addresses || [])];

      if (editingAddress) {
        updatedAddresses = updatedAddresses.map(a =>
          a.id === editingAddress.id ? { ...formData, id: a.id } : a
        );
      } else {
        updatedAddresses.push({ ...formData, id: Math.random().toString(36).substr(2, 9) });
      }

      await apiClient.put('/users/profile', { addresses: updatedAddresses });
      dispatch(getProfile());
      showToast('Address saved successfully', 'success');
      setShowModal(false);
    } catch (error) {
      showToast('Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const updatedAddresses = user?.addresses?.filter(a => a.id !== id) || [];
          await apiClient.put('/users/profile', { addresses: updatedAddresses });
          dispatch(getProfile());
          showToast('Address deleted', 'info');
        } catch (e) {
          showToast('Delete failed', 'error');
        }
      }}
    ]);
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{item.label || 'Other'}</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.iconBtn}>
            <Icon name="pencil-outline" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
            <Icon name="trash-can-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>{item.city}, {item.state} - {item.zip}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={handleOpenAdd} style={styles.backBtn}>
          <Icon name="plus" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={user?.addresses || []}
        keyExtractor={(item) => item.id}
        renderItem={renderAddressItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="map-marker-off-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyText}>No addresses saved yet</Text>
            <TouchableOpacity style={styles.addBtnLarge} onPress={handleOpenAdd}>
              <Text style={styles.addBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'New Address'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Label (e.g. Home, Office)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Home"
                  placeholderTextColor={colors.gray}
                  value={formData.label}
                  onChangeText={(t) => setFormData({...formData, label: t})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123, Toy Lane"
                  placeholderTextColor={colors.gray}
                  value={formData.street}
                  onChangeText={(t) => setFormData({...formData, street: t})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mumbai"
                    placeholderTextColor={colors.gray}
                    value={formData.city}
                    onChangeText={(t) => setFormData({...formData, city: t})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Zip Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="400001"
                    placeholderTextColor={colors.gray}
                    keyboardType="numeric"
                    value={formData.zip}
                    onChangeText={(t) => setFormData({...formData, zip: t})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Maharashtra"
                  placeholderTextColor={colors.gray}
                  value={formData.state}
                  onChangeText={(t) => setFormData({...formData, state: t})}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
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
  list: { padding: 20 },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.light,
  },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelBadge: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  labelText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  actionRow: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15 },
  addressText: { ...FONTS.body, color: colors.text, fontSize: 14, marginBottom: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...FONTS.body, color: colors.gray, marginTop: 15, marginBottom: 20 },
  addBtnLarge: { backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  addBtnText: { ...FONTS.h3, color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...FONTS.h2, fontSize: 18, color: colors.text },
  inputGroup: { marginBottom: 15 },
  label: { ...FONTS.body, fontSize: 14, fontWeight: '700', marginBottom: 5, color: colors.text },
  input: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: colors.lightGray, color: colors.text },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveBtnText: { ...FONTS.h3, color: '#FFF' }
});

export default AddressScreen;
