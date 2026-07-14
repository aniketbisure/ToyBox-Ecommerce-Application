import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { showToast } from '../utils/toastService';
import { useTheme } from '../hooks/useTheme';

const RecentlyViewedScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { recentlyViewed = [] } = useSelector((state: RootState) => state.products) || {};
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items ?? []);

  const isWishlisted = (id: string) => wishlistItems.some(item => item.id === id);

  const renderProductItem = ({ item }: any) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      onAddToCart={() => {
        dispatch(addToCart({ ...item, quantity: 1 }));
        showToast('Added to cart', 'success');
      }}
      isWishlisted={isWishlisted(item.id || item._id)}
      onWishlistPress={() => dispatch(toggleWishlist(item))}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recently Viewed</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={recentlyViewed}
        keyExtractor={(item, index) => (item.id || item._id) + index}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={80} color={colors.lightGray} />
            <Text style={[styles.emptyText, { color: colors.gray }]}>Your history is empty</Text>
            <TouchableOpacity
                style={[styles.shopBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => navigation.navigate('HomeTab')}
            >
                <Text style={styles.shopBtnText}>Start Browsing</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20 },
  listContent: { paddingHorizontal: 10, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { ...FONTS.body, marginTop: 20, textAlign: 'center', marginBottom: 20 },
  shopBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  shopBtnText: { color: '#FFF', fontWeight: '700' }
});

export default RecentlyViewedScreen;
