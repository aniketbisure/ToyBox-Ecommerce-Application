import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { toggleWishlist, syncWishlist } from '../redux/slices/wishlistSlice';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

const WishlistScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch<AppDispatch>();
  const { items = [] } = useSelector((state: RootState) => state.wishlist) || {};
  const cartItems = useSelector((state: RootState) => state.cart?.items ?? []);
  const { isAuthenticated = false } = useSelector((state: RootState) => state.auth) || {};

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.itemRow}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
        >
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => <Icon key={s} name="star" size={14} color={s <= (item.rating || 0) ? "#FFA41C" : "#EEE"} />)}
            <Text style={styles.ratingCount}>({item.numReviews || 0})</Text>
          </View>
          <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
          <Text style={styles.stockText}>In Stock</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => {
            dispatch(addToCart({...item, quantity: 1}));
            if (isAuthenticated) {
              const existingItem = cartItems.find(i => i.id === item.id);
              const nextCart = existingItem
                ? cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...cartItems, { ...item, quantity: 1 }];
              dispatch(syncCart(nextCart));
            }
            showToast('Added to cart', 'success');
          }}
        >
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => {
            dispatch(toggleWishlist(item));
            if (isAuthenticated) {
              const nextWishlist = items.filter(i => i.id !== item.id);
              dispatch(syncWishlist(nextWishlist));
            }
          }}
        >
          <Text style={styles.removeText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Wish List</Text>
        <Text style={styles.subtitle}>{items.length} items</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart-outline" size={80} color="#DDD" />
          <Text style={styles.emptyTitle}>Your Wish List is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
            <Text style={styles.shopLink}>Continue shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.light,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.gray, marginTop: 4, fontWeight: '600' },
  list: { paddingVertical: 15, paddingHorizontal: 15 },
  card: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    ...SHADOWS.light,
  },
  itemRow: { flexDirection: 'row' },
  imageContainer: {
    width: 90,
    height: 90,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '85%', height: '85%' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 15, color: colors.text, lineHeight: 20, fontWeight: '600', marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  ratingCount: { fontSize: 12, color: colors.gray, marginLeft: 5 },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 5 },
  stockText: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  addCartBtn: {
    backgroundColor: COLORS.primary,
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  addCartText: { fontSize: 14, color: COLORS.white, fontWeight: '700' },
  removeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  removeText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 10, textAlign: 'center' },
  shopLink: { fontSize: 16, color: COLORS.secondary, fontWeight: '700', textDecorationLine: 'underline' },
});

export default WishlistScreen;
