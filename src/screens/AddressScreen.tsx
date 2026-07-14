import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updateUserAddress } from '../redux/slices/authSlice';
import apiClient from '../api/apiClient';

const AddressScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || 'India'
  });

  const handleSave = async () => {
    if (!address.street || !address.city || !address.zip) {
      showToast('Please fill in required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      // Persist address to backend so it survives logout
      await apiClient.put('/users/profile', {
        name: user?.name,
        email: user?.email,
        address,
      });
      // Also update Redux state for immediate UI update
      dispatch(updateUserAddress(address));
      showToast('Address saved successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showToast('Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123, Toy Lane"
            placeholderTextColor={COLORS.gray}
            value={address.street}
            onChangeText={(text) => setAddress({...address, street: text})}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mumbai"
              placeholderTextColor={COLORS.gray}
              value={address.city}
              onChangeText={(text) => setAddress({...address, city: text})}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="400001"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              value={address.zip}
              onChangeText={(text) => setAddress({...address, zip: text})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Maharashtra"
            placeholderTextColor={COLORS.gray}
            value={address.state}
            onChangeText={(text) => setAddress({...address, state: text})}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 15, height: 55, ...FONTS.body, ...SHADOWS.light },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, ...SHADOWS.medium },
  saveBtnText: { ...FONTS.h3, color: COLORS.white }
});

export default AddressScreen;
