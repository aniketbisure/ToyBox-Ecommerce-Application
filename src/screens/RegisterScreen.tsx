import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegisterScreenNavigationProp } from '../types/navigation';

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const resultAction = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      showToast('Account created! Welcome to ToyBox', 'success');
    } else if (registerUser.rejected.match(resultAction)) {
      showToast(resultAction.payload as string || 'Registration failed', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            dispatch(clearError());
            navigation.goBack();
          }}
        >
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community and start your toy adventure</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.gray}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="aniket@example.com"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <CustomButton
            title="Sign Up Now"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => {
              dispatch(clearError());
              navigation.navigate('Login');
            }}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    ...FONTS.h1,
    fontSize: 32,
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.gray,
    marginTop: 5,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 25,
    ...SHADOWS.medium,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.body,
    fontWeight: '700',
    marginBottom: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.text,
    fontSize: 15,
  },
  registerBtn: {
    marginTop: 10,
    marginBottom: 25,
    borderRadius: 15,
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  footerText: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 14,
  },
  loginText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#CBD5E0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...SHADOWS.light,
  }
});

export default RegisterScreen;
