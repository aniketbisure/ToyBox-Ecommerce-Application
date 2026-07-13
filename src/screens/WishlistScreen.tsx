import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../components/Skeleton';

const WishlistScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.wishlist);
  const loading = false; // Add a placeholder loading state or use one from Redux if available

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 25 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width={80} height={80} borderRadius={SIZES.radius - 4} />
          <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
            <Skeleton width="60%" height={15} />
            <Skeleton width="80%" height={20} style={{ marginTop: 8 }} />
            <Skeleton width="40%" height={20} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price.toFixed(0)}</Text>
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={() => {
              dispatch(addToCart({...item, quantity: 1}));
              showToast('Added to cart', 'success');
            }}
          >
            <Icon name="cart-plus" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => dispatch(toggleWishlist(item))}
      >
        <Icon name="heart" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.count}>{items.length} items</Text>
      </View>

      {items.length === 0 ? (
        loading ? (
          renderSkeleton()
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="heart-outline" size={80} color={COLORS.lightGray} />
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>Tap the heart icon on any toy to save it for later!</Text>
            <CustomButton
              title="Go Shopping"
              onPress={() => navigation.navigate('HomeTab')}
              style={styles.shopBtn}
            />
          </View>
        )
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    ...FONTS.h1,
    fontSize: 28,
  },
  count: {
    ...FONTS.body,
    color: COLORS.gray,
    marginTop: -4,
  },
  list: {
    paddingHorizontal: 25,
    paddingBottom: 110,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 15,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '85%',
    height: '80%',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  category: {
    ...FONTS.caption,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
    marginBottom: 2,
  },
  name: {
    ...FONTS.h3,
    fontSize: 15,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontSize: 18,
  },
  addCartBtn: {
    backgroundColor: COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  emptyTitle: {
    ...FONTS.h2,
    marginBottom: 10,
  },
  emptySubtitle: {
    ...FONTS.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopBtn: {
    width: '100%',
  },
});

export default WishlistScreen;
