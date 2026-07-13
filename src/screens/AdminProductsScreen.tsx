import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../redux/slices/productSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';

const AdminProductsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.products);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const resultAction = await dispatch(deleteProduct(productId));
            if (deleteProduct.fulfilled.match(resultAction)) {
              showToast('Product deleted successfully', 'success');
            } else {
              showToast('Failed to delete product', 'error');
            }
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }: any) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]}
          onPress={() => navigation.navigate('EditProduct', { product: item })}
        >
          <Icon name="pencil" size={20} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
          onPress={() => handleDeleteProduct(item.id || item._id, item.name)}
        >
          <Icon name="trash-can-outline" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('EditProduct', { product: null })}
        >
          <Icon name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={22} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant" size={60} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(15),
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: moderateScale(20),
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: moderateScale(20),
    paddingHorizontal: moderateScale(15),
    borderRadius: 12,
    height: moderateScale(50),
    marginBottom: moderateScale(20),
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    ...FONTS.body,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: moderateScale(12),
    borderRadius: 15,
    marginBottom: moderateScale(15),
    ...SHADOWS.light,
  },
  productImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  productInfo: {
    flex: 1,
    marginLeft: moderateScale(15),
  },
  productName: {
    ...FONTS.h3,
    fontSize: moderateScale(15),
  },
  productCategory: {
    ...FONTS.caption,
    color: COLORS.gray,
  },
  productPrice: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontSize: moderateScale(14),
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.gray,
    marginTop: 10,
  }
});

export default AdminProductsScreen;
