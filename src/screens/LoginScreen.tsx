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
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import Logo from '../components/common/Logo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginScreenNavigationProp } from '../types/navigation';

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    console.log('--- LOGIN START ---');
    console.log('Email:', email);

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      console.log('Result Action Type:', resultAction.type);

      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login Success:', resultAction.payload.user.email);
        showToast(`Welcome back, ${resultAction.payload.user.name}!`, 'success');
      } else if (loginUser.rejected.match(resultAction)) {
        console.error('Login Rejected:', resultAction.payload);
        const errorMessage = resultAction.payload as string || 'Invalid email or password. Please try again.';
        showToast(errorMessage, 'error');
      }
    } catch (err: any) {
      console.error('Login Exception:', err.message);
      showToast('An unexpected error occurred', 'error');
    }
    console.log('--- LOGIN END ---');
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
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={28} color="#2D3436" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size={120} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Unlock a world of play for your little ones</Text>
        </View>

        <View style={styles.formCard}>
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
                placeholder="••••••••"
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

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword' as any)}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Login to Account"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => {
              dispatch(clearError());
              navigation.navigate('Register');
            }}>
              <Text style={styles.signupText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR LOGIN WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: '#EA4335' }]}
              onPress={() => showToast('Google login coming soon', 'info')}
            >
              <Icon name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: '#1877F2' }]}
              onPress={() => showToast('Facebook login coming soon', 'info')}
            >
              <Icon name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: '#000000' }]}
              onPress={() => showToast('Apple login coming soon', 'info')}
            >
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...FONTS.h1,
    fontSize: 32,
    color: '#2D3436',
    letterSpacing: 1,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 25,
    ...SHADOWS.medium,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.body,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2D3436',
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
    color: '#000000',
    fontSize: 15,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  loginBtn: {
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
  signupText: {
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

export default LoginScreen;
