import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Share, FlatList, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { toggleWishlist, syncWishlist, setWishlist } from '../redux/slices/wishlistSlice';
import { addToRecentlyViewed, syncRecentlyViewed } from '../redux/slices/productSlice';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SIZES, SHADOWS, ThemeColors } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items ?? []);
  const cartItems = useSelector((state: RootState) => state.cart?.items ?? []);
  const { isAuthenticated = false } = useSelector((state: RootState) => state.auth) || {};
  const flatListRef = useRef<FlatList>(null);

  const isWishlisted = wishlistItems.some(item => (item.id || (item as any)._id) === (product.id || product._id));

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { recentlyViewed = [] } = useSelector((state: RootState) => state.products) || {};

  React.useEffect(() => {
    dispatch(addToRecentlyViewed(product));
    if (isAuthenticated) {
      const exists = recentlyViewed.find(p => (p.id || (p as any)._id) === (product.id || product._id));
      if (!exists) {
        dispatch(syncRecentlyViewed([product, ...recentlyViewed]));
      }
    }
    fetchProductDetails();
  }, [dispatch, product.id, product._id]);

  const fetchProductDetails = async () => {
    try {
      const { data } = await api.get(`/products/${product.id || product._id}`);
      const updatedProduct = { ...data, id: data.id || data._id };
      setProduct(updatedProduct);
    } catch (e) {
      console.log('Error refreshing product details');
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleToggleWishlist = async () => {
    const previousWishlist = [...wishlistItems];
    dispatch(toggleWishlist(product));

    if (isAuthenticated) {
      try {
        const nextWishlist = isWishlisted
          ? wishlistItems.filter(item => item.id !== (product.id || product._id))
          : [...wishlistItems, product];

        const resultAction = await dispatch(syncWishlist(nextWishlist));

        if (syncWishlist.rejected.match(resultAction)) {
          throw new Error('Sync failed');
        }
      } catch (err) {
        // Rollback UI state if server sync fails
        dispatch(setWishlist(previousWishlist));
        showToast('Failed to sync wishlist. Reverting...', 'error');
      }
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    if (isAuthenticated) {
      const existingItem = cartItems.find(item => item.id === product.id);
      let nextCart = existingItem
        ? cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...cartItems, { ...product, quantity }];
      dispatch(syncCart(nextCart));
    }
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigation.navigate('CartTab', { screen: 'Checkout' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on ToyBox: ₹${product.price}`,
        url: product.image,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const discount = product.listPrice && product.listPrice > product.price
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <View style={styles.headerIconBg}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitleText}>Product Details</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <View style={styles.headerIconBg}>
              <Icon name="share-variant" size={22} color={colors.text} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleWishlist} style={styles.headerBtn}>
            <View style={styles.headerIconBg}>
              <Icon name={isWishlisted ? "heart" : "heart-outline"} size={22} color={isWishlisted ? COLORS.primary : colors.text} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={styles.imageItem}>
                <Image source={{ uri: item }} style={styles.mainImage} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(_, index) => `img-${index}`}
          />
          <View style={styles.imagePagination}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, activeImageIndex === i && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.mainInfoCard}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand || 'ToyBox Originals'}</Text>
            <View style={styles.ratingBox}>
              <Icon name="star" size={16} color={COLORS.accent} />
              <Text style={styles.ratingVal}>{product.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.ratingCount}>({product.numReviews || 0})</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.priceText}>{Math.floor(product.price).toLocaleString()}</Text>
              <Text style={styles.fraction}>.00</Text>
            </View>
            {discount > 0 && (
              <View style={styles.discountContainer}>
                <Text style={styles.discountTag}>{discount}% OFF</Text>
                <Text style={styles.mrpText}>₹{product.listPrice}</Text>
              </View>
            )}
          </View>

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <Icon name="truck-delivery-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.deliveryDate}>FREE delivery by <Text style={{fontWeight: '700'}}>Tomorrow</Text></Text>
            </View>
            <View style={[styles.deliveryRow, { marginTop: 8 }]}>
              <Icon name="map-marker-outline" size={18} color={colors.gray} />
              <Text style={styles.deliveryLocation} numberOfLines={1}>
                Deliver to {isAuthenticated ? 'you' : 'Guest'}
              </Text>
            </View>
          </View>

          <Text style={styles.stockStatus}>In Stock</Text>
        </View>

        {/* Buy Box */}
        <View style={styles.actionSection}>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyPicker}>
              <TouchableOpacity onPress={() => quantity > 1 && setQuantity(q => q - 1)} style={styles.qtyBtn}>
                <Icon name="minus" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>
                <Icon name="plus" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
              <Icon name="cart-plus" size={22} color={COLORS.white} style={{marginRight: 8}} />
              <Text style={styles.addCartText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Technical Details */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.specsTable}>
            {[
              { label: 'Brand', value: product.brand },
              { label: 'Sub-Category', value: product.subCategory },
              { label: 'Material', value: product.materialType },
              { label: 'SKU', value: product.sku },
            ].filter(s => s.value).map((spec, index) => (
              <View key={index} style={[styles.specRow, index % 2 === 0 && styles.specRowEven]}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {product.smallPartsWarning && (
          <View style={styles.safetySection}>
            <View style={styles.safetyHeader}>
              <Icon name="alert-circle-outline" size={20} color="#B12704" />
              <Text style={styles.safetyTitle}>Safety Warning</Text>
            </View>
            <Text style={styles.safetyText}>{product.safetyWarningText || 'CHOKING HAZARD – Small parts. Not for children under 3 yrs.'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBtn: { padding: 5 },
  headerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  headerTitleText: {
    ...FONTS.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    opacity: 0,
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  scrollContent: { paddingBottom: 150 },

  imageGallery: {
    width: width,
    height: width * 1.1,
    backgroundColor: isDarkMode ? colors.card : COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  imageItem: { width: width, height: width * 1.1, justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '85%', height: '85%' },
  imagePagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray,
    marginHorizontal: 4,
    opacity: 0.3,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
    opacity: 1,
  },

  mainInfoCard: {
    padding: 20,
    backgroundColor: colors.card,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOWS.medium,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingVal: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  title: {
    ...FONTS.h2,
    color: colors.text,
    lineHeight: 30,
    marginBottom: 15,
  },

  priceContainer: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 5,
  },
  priceText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
  },
  fraction: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 5,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  discountTag: {
    backgroundColor: COLORS.primary + '20',
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  mrpText: {
    fontSize: 14,
    color: colors.gray,
    textDecorationLine: 'line-through',
  },

  deliveryCard: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryDate: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
  },
  stockStatus: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '700',
  },

  actionSection: {
    padding: 20,
    backgroundColor: colors.card,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  qtyLabel: {
    ...FONTS.h3,
    color: colors.text,
  },
  qtyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    padding: 5,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 20,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  addCartBtn: {
    flex: 1,
    backgroundColor: colors.text,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addCartText: {
    fontSize: 16,
    color: colors.card,
    fontWeight: '700',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buyNowText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '700',
  },

  divider: { height: 8, backgroundColor: colors.lightGray, marginVertical: 10 },
  descriptionSection: { padding: 20 },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: 20,
    color: colors.text,
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  specsSection: { padding: 20 },
  specsTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specRowEven: {
    backgroundColor: colors.lightGray + '30',
  },
  specLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
  },
  specValue: {
    flex: 1.5,
    fontSize: 14,
    color: colors.text,
  },
  safetySection: {
    margin: 20,
    padding: 15,
    backgroundColor: isDarkMode ? '#2D1E1E' : '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? '#4D2D2D' : '#FFDADA',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: isDarkMode ? '#FF8A8A' : '#B12704',
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 13,
    color: isDarkMode ? '#FFDADA' : '#444',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default ProductDetailScreen;
