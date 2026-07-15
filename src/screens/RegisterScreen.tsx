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
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { RegisterScreenNavigationProp } from '../types/navigation';

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            dispatch(clearError());
            navigation.goBack();
          }}
        >
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community and start your toy adventure</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.gray}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.gray}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  subtitle: {
    ...FONTS.body,
    color: colors.gray,
    marginTop: 5,
  },
  formCard: {
    backgroundColor: colors.card,
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
    color: colors.text,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    color: colors.text,
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
    color: colors.gray,
    fontSize: 14,
  },
  loginText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default RegisterScreen;
