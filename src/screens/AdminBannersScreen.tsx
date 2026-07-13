import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';
import apiClient from '../api/apiClient';
import { fetchAppConfig } from '../redux/slices/configSlice';
import { useTheme } from '../hooks/useTheme';

const AdminBannersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch<AppDispatch>();
  const { banners } = useSelector((state: RootState) => state.config);

  const handleDeleteBanner = (id: string) => {
    Alert.alert(
      'Delete Banner',
      'Are you sure you want to delete this promotional banner?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/config/banners/${id}`);
              showToast('Banner deleted', 'success');
              dispatch(fetchAppConfig());
            } catch (error) {
              showToast('Delete failed', 'error');
            }
          }
        }
      ]
    );
  };

  const renderBannerItem = ({ item }: any) => (
    <View style={styles.bannerCard}>
      <View style={[styles.preview, { backgroundColor: item.color || colors.primary }]}>
        <Text style={styles.previewTitle}>{item.title}</Text>
        <Text style={styles.previewSub}>{item.subtitle}</Text>
        <Icon name={item.icon || 'gift'} size={40} color="rgba(255,255,255,0.3)" style={styles.previewIcon} />
      </View>
      <View style={styles.bannerInfo}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleDeleteBanner(item._id)}>
          <Icon name="trash-can-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Banner Control</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => showToast('Banner creation feature coming soon to mobile. Use web panel for now.', 'info')}
        >
          <Icon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={banners}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderBannerItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Active Banners</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No active banners</Text>}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  addBtn: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  sectionTitle: { ...FONTS.h3, marginBottom: 15, color: colors.text },
  bannerCard: { backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden', marginBottom: 20, ...SHADOWS.medium },
  preview: { height: 100, padding: 15, justifyContent: 'center' },
  previewTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  previewSub: { color: '#FFF', opacity: 0.8, fontSize: 12 },
  previewIcon: { position: 'absolute', right: 10, bottom: 10 },
  bannerInfo: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { ...FONTS.body, fontWeight: '700', color: colors.text },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.gray }
});

export default AdminBannersScreen;
