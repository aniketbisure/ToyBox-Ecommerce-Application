import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { getProfile } from '../redux/slices/authSlice';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';

const EditProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!formData.name || !formData.email) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/auth/profile', formData);
      showToast('Profile updated successfully', 'success');
      dispatch(getProfile());
      navigation.goBack();
    } catch (error) {
      showToast('Failed to update profile', 'error');
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => setFormData({...formData, email: text})}
          />
        </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { ...FONTS.h2, fontSize: 20 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 15, height: 55, ...FONTS.body, ...SHADOWS.light },
  saveBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, ...SHADOWS.medium },
  saveBtnText: { ...FONTS.h3, color: COLORS.white }
});

export default EditProfileScreen;
