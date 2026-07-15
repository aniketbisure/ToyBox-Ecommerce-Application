import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { FONTS, ThemeColors } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { showToast } from '../utils/toastService';
import apiClient from '../api/apiClient';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    setLoading(true);
    try {
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
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon name="arrow-left" size={26} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={20} color={colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="aniket@example.com"
              placeholderTextColor={colors.gray}
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

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: insets.top },
  backBtn: { padding: 15 },
  title: { ...FONTS.h1, fontSize: 32, color: colors.text, marginBottom: 10 },
  subtitle: { ...FONTS.body, color: colors.gray, marginBottom: 30 },
  inputContainer: { marginBottom: 25 },
  label: { ...FONTS.body, color: colors.text, fontWeight: '700', marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, ...FONTS.body, color: colors.text },
  btn: { borderRadius: 15, height: 56 }
});

export default ForgotPasswordScreen;
