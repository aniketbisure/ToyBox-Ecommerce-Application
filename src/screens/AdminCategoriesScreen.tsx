import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
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

const AdminCategoriesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.config);
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setIsAdding(true);
    try {
      // Assuming backend has a POST /api/config/categories endpoint
      await apiClient.post('/config/categories', { name: newCategory });
      showToast('Category added successfully', 'success');
      setNewCategory('');
      dispatch(fetchAppConfig());
    } catch (error) {
      showToast('Failed to add category', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = (name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/config/categories/${name}`);
              showToast('Category removed', 'success');
              dispatch(fetchAppConfig());
            } catch (error) {
              showToast('Failed to remove category', 'error');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter new category name..."
          placeholderTextColor={COLORS.gray}
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity
          style={[styles.addBtn, !newCategory.trim() && { opacity: 0.5 }]}
          onPress={handleAddCategory}
          disabled={!newCategory.trim() || isAdding}
        >
          {isAdding ? <ActivityIndicator color="#FFF" /> : <Icon name="plus" size={24} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryInfo}>
              <Icon name="tag-outline" size={20} color={COLORS.primary} />
              <Text style={styles.categoryName}>{item}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
              <Icon name="trash-can-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { ...FONTS.h2, fontSize: 20 },
  inputSection: { flexDirection: 'row', padding: 20, gap: 10 },
  input: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 15, height: 50, ...SHADOWS.light },
  addBtn: { backgroundColor: COLORS.primary, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  list: { padding: 20 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 15, borderRadius: 15, marginBottom: 10, ...SHADOWS.light },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { ...FONTS.body, marginLeft: 10, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { ...FONTS.body, color: COLORS.gray }
});

export default AdminCategoriesScreen;
