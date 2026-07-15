import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { getProfile } from '../redux/slices/authSlice';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const EditProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumbers: user?.phoneNumbers || [],
  });
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!formData.name || !formData.email) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumbers: formData.phoneNumbers
      };
      await apiClient.put('/users/profile', updateData);
      showToast('Profile updated successfully', 'success');
      dispatch(getProfile());
      navigation.goBack();
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () => {
    if (newPhone.length < 10) {
      showToast('Invalid phone number', 'error');
      return;
    }
    setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, newPhone] });
    setNewPhone('');
  };

  const removePhone = (index: number) => {
    const updated = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData({ ...formData, phoneNumbers: updated });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.gray}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={colors.gray}
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => setFormData({...formData, email: text})}
          />
        </View>

        <Text style={styles.sectionTitle}>Phone Numbers</Text>

        {formData.phoneNumbers.map((phone, index) => (
          <View key={index} style={styles.phoneRow}>
            <Text style={styles.phoneText}>{phone}</Text>
            <TouchableOpacity onPress={() => removePhone(index)}>
              <Icon name="delete-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addPhoneContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
            placeholder="Add new phone..."
            placeholderTextColor={colors.gray}
            value={newPhone}
            keyboardType="phone-pad"
            onChangeText={setNewPhone}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addPhone}>
            <Icon name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.manageAddressBtn}
          onPress={() => navigation.navigate('Address')}
        >
          <Icon name="map-marker-outline" size={20} color={COLORS.primary} />
          <Text style={styles.manageAddressText}>Manage Shipping Addresses</Text>
          <Icon name="chevron-right" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 8, fontSize: 14, color: colors.text },
  sectionTitle: { ...FONTS.h3, marginTop: 10, marginBottom: 15, color: colors.text },
  input: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 15, height: 55, ...FONTS.body, color: colors.text, ...SHADOWS.light },
  phoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 15, borderRadius: 12, marginBottom: 10, ...SHADOWS.light },
  phoneText: { ...FONTS.body, color: colors.text },
  addPhoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  addBtn: { backgroundColor: COLORS.primary, height: 55, width: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  manageAddressBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', padding: 15, borderRadius: 12, marginTop: 10, marginBottom: 20 },
  manageAddressText: { flex: 1, marginLeft: 10, color: COLORS.primary, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, ...SHADOWS.medium },
  saveBtnText: { ...FONTS.h3, color: COLORS.white }
});

export default EditProfileScreen;
