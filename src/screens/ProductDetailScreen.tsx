import React, { useState, useRef, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert, FlatList, Modal, Share, TextInput, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { toggleWishlist, syncWishlist } from '../redux/slices/wishlistSlice';
import { addToRecentlyViewed, syncRecentlyViewed } from '../redux/slices/productSlice';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale, verticalScale } from '../utils/responsive';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items ?? []);
  const cartItems = useSelector((state: RootState) => state.cart?.items ?? []);
  const { isAuthenticated = false, user = null } = useSelector((state: RootState) => state.auth) || {};
  const flatListRef = useRef<FlatList>(null);

  const isWishlisted = wishlistItems.some(item => (item.id || (item as any)._id) === (product.id || product._id));

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    if (isAuthenticated) {
      const nextWishlist = isWishlisted
        ? wishlistItems.filter(item => item.id !== (product.id || product._id))
        : [...wishlistItems, product];
      dispatch(syncWishlist(nextWishlist));
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
              <Icon name="map-marker-outline" size={18} color={COLORS.gray} />
              <Text style={styles.deliveryLocation} numberOfLines={1}>
                Deliver to {user?.name || 'Guest'} - {user?.addresses && user.addresses.length > 0 ? user.addresses[0].city : 'Set Location'}
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
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Reviews */}
        <View style={styles.reviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(true)}>
              <Text style={styles.writeReviewLink}>Rate Product</Text>
            </TouchableOpacity>
          </View>

          {product.reviews?.length > 0 ? (
            product.reviews.map((review: any, i: number) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.userRow}>
                  <View style={styles.userAvatarBg}>
                    <Text style={styles.avatarText}>{review.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{review.name}</Text>
                    <View style={styles.reviewRatingRow}>
                      {[1,2,3,4,5].map(s => <Icon key={s} name="star" size={14} color={s <= review.rating ? COLORS.accent : COLORS.lightGray} />)}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyReviews}>
              <Icon name="message-draw" size={40} color={COLORS.lightGray} />
              <Text style={styles.noReviews}>Be the first to review this product!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>

  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  headerTitleText: {
    ...FONTS.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    opacity: 0, // Hidden by default, can be shown on scroll
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  scrollContent: { paddingBottom: 100 },

  imageGallery: {
    width: width,
    height: width * 1.1,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.gray,
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
    backgroundColor: COLORS.lightGray,
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
  deliveryLocation: {
    fontSize: 13,
    color: colors.gray,
    marginLeft: 10,
    flex: 1,
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
  reviewSection: { padding: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  writeReviewLink: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewCard: {
    marginBottom: 25,
    backgroundColor: colors.lightGray + '50',
    padding: 15,
    borderRadius: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatarBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noReviews: {
    textAlign: 'center',
    color: colors.gray,
    marginTop: 10,
    fontSize: 14,
  },
});

export default ProductDetailScreen;
