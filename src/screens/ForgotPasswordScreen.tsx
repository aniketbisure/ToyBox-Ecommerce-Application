import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { showToast } from '../utils/toastService';
import apiClient from '../api/apiClient';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    setLoading(true);
    try {
      // Assuming endpoint /auth/forgot-password exists
      await apiClient.post('/auth/forgot-password', { email });
      showToast('Password reset link sent to your email', 'success');
      navigation.goBack();
    } catch (error) {
      showToast('If an account exists, a reset link has been sent.', 'info');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon name="arrow-left" size={26} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="aniket@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <CustomButton
          title="Send Reset Link"
          onPress={handleReset}
          loading={loading}
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  backBtn: { padding: 15 },
  title: { ...FONTS.h1, fontSize: 32, color: COLORS.text, marginBottom: 10 },
  subtitle: { ...FONTS.body, color: COLORS.gray, marginBottom: 30 },
  inputContainer: { marginBottom: 25 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 15, paddingHorizontal: 15, height: 56, borderWidth: 1, borderColor: '#F0F0F0' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, ...FONTS.body },
  btn: { borderRadius: 15, height: 56 }
});

export default ForgotPasswordScreen;
