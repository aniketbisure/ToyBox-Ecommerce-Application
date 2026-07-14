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
  TextInput,
  Modal,
  ActivityIndicator
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

  const [modalVisible, setModalVisible] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', color: COLORS.primary, icon: 'gift', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.subtitle) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      // Basic validation for dates if provided
      const payload = { ...newBanner };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      await apiClient.post('/config/banners', payload);
      showToast('Banner added successfully', 'success');
      setModalVisible(false);
      setNewBanner({ title: '', subtitle: '', color: COLORS.primary, icon: 'gift', startDate: '', endDate: '' });
      dispatch(fetchAppConfig());
    } catch (error) {
      showToast('Failed to add banner', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        <View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          {(item.startDate || item.endDate) && (
            <Text style={styles.bannerSchedule}>
              {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Start'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'End'}
            </Text>
          )}
        </View>
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
          onPress={() => setModalVisible(true)}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Banner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.text }]}>Banner Title</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                placeholder="Summer Sale 2024"
                placeholderTextColor={colors.gray}
                value={newBanner.title}
                onChangeText={(val) => setNewBanner({ ...newBanner, title: val })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Subtitle / Offer Text</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                placeholder="Get up to 50% off on all toys"
                placeholderTextColor={colors.gray}
                value={newBanner.subtitle}
                onChangeText={(val) => setNewBanner({ ...newBanner, subtitle: val })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Background Color (Hex)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                placeholder="#FF6B6B"
                placeholderTextColor={colors.gray}
                value={newBanner.color}
                onChangeText={(val) => setNewBanner({ ...newBanner, color: val })}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray}
                    value={newBanner.startDate}
                    onChangeText={(val) => setNewBanner({ ...newBanner, startDate: val })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray}
                    value={newBanner.endDate}
                    onChangeText={(val) => setNewBanner({ ...newBanner, endDate: val })}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddBanner}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.white }]}>Create Banner</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  bannerSchedule: { ...FONTS.caption, color: colors.gray, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...FONTS.h2, fontSize: 20 },
  label: { ...FONTS.body, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { fontWeight: '700', fontSize: 16 },
});

export default AdminBannersScreen;
