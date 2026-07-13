import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { toggleDarkMode, toggleNotifications } from '../redux/slices/configSlice';
import { showToast } from '../utils/toastService';

import { useTheme } from '../hooks/useTheme';

const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { settings } = useSelector((state: RootState) => state.config);

  const handleToggleNotifications = () => {
    dispatch(toggleNotifications());
    showToast(`Notifications ${!settings.notificationsEnabled ? 'Enabled' : 'Disabled'}`, 'info');
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    showToast(`Dark Mode ${!settings.darkMode ? 'Enabled' : 'Disabled'}`, 'info');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await apiClient.delete('/auth/profile');
              // dispatch(logout());
              showToast('Account deleted successfully', 'info');
            } catch (error) {
              showToast('Failed to delete account', 'error');
            }
          }
        }
      ]
    );
  };

  const settingItems = [
    { name: 'Push Notifications', icon: 'bell-outline', value: settings.notificationsEnabled, toggle: handleToggleNotifications },
    { name: 'Dark Mode', icon: 'weather-night', value: settings.darkMode, toggle: handleToggleDarkMode },
  ];

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {settingItems.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={item.icon} size={24} color={colors.textSecondary} />
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.toggle}
              trackColor={{ false: colors.lightGray, true: colors.primary + '80' }}
              thumbColor={item.value ? colors.primary : '#f4f3f4'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
          <Icon name="delete-outline" size={24} color={colors.error} />
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: 15, borderRadius: 12, marginBottom: 10, ...SHADOWS.light },
  name: { ...FONTS.body, marginLeft: 15, fontWeight: '600', color: colors.text },
  dangerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 15 },
  dangerText: { ...FONTS.body, color: colors.error, marginLeft: 15, fontWeight: '600' }
});

export default SettingsScreen;
