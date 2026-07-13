import React, { useState, useRef, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert, FlatList, Modal, Share, TextInput, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { toggleWishlist, syncWishlist } from '../redux/slices/wishlistSlice';
import { addToRecentlyViewed } from '../redux/slices/productSlice';
import { RootState, AppDispatch } from '../redux/store';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { moderateScale, verticalScale } from '../utils/responsive';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../components/Skeleton';
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
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const flatListRef = useRef<FlatList>(null);

  const isWishlisted = wishlistItems.some(item => item.id === product.id);

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  React.useEffect(() => {
    dispatch(addToRecentlyViewed(product));
    fetchProductDetails();
  }, [dispatch, product.id]);

  const fetchProductDetails = async () => {
    try {
      const { data } = await api.get(`/products/${product.id}`);
      setProduct(data);
    } catch (e) {
      console.log('Error refreshing product details');
    }
  };

  const submitReview = async () => {
    if (!userComment.trim()) {
      showToast('Please add a comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating: userRating,
        comment: userComment
      });
      showToast('Review submitted successfully!', 'success');
      setShowReviewModal(false);
      setUserComment('');
      fetchProductDetails(); // Refresh to show new review
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Ensure we have an array of images
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    if (isAuthenticated) {
      // Small timeout to let redux state update or pass new state directly
      const nextWishlist = isWishlisted
        ? wishlistItems.filter(item => item.id !== product.id)
        : [...wishlistItems, product];
      dispatch(syncWishlist(nextWishlist));
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    if (isAuthenticated) {
      const existingItem = cartItems.find(item => item.id === product.id);
      let nextCart;
      if (existingItem) {
        nextCart = cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        nextCart = [...cartItems, { ...product, quantity }];
      }
      dispatch(syncCart(nextCart));
    }
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigation.navigate('CartTab', { screen: 'Checkout' });
  };

  const handleThumbnailPress = (index: number) => {
    setActiveImageIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this awesome toy on ToyBox: ${product.name} for only ₹${product.price}!`,
        url: product.image,
        title: product.name,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Full Screen Image Modal */}
      <Modal visible={isFullScreen} transparent={true} animationType="fade">
        <View style={styles.fullScreenModal}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsFullScreen(false)}>
            <Icon name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <Image source={{ uri: images[activeImageIndex] }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* FIXED HEADER */}
      <View style={styles.staticHeader}>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.headerActionBtn, { marginRight: moderateScale(12) }]}
            onPress={handleShare}
          >
            <Icon name="share-variant-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleToggleWishlist}
          >
            <Icon
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Gallery */}
        <View style={styles.galleryWrapper}>
          <View style={styles.mainImageContainer}>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={1} onPress={() => setIsFullScreen(true)} style={styles.mainSlide}>
                  <Image source={{ uri: item }} style={styles.imageMain} resizeMode="contain" />
                </TouchableOpacity>
              )}
              keyExtractor={(_, index) => `img-${index}`}
            />
            <View style={styles.badgeCounter}>
              <Text style={styles.textCounter}>{activeImageIndex + 1}/{images.length}</Text>
            </View>
          </View>

          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbScroll}>
              {images.map((item, index) => (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  style={[styles.thumbItem, activeImageIndex === index && styles.activeThumbItem]}
                  onPress={() => handleThumbnailPress(index)}
                >
                  <Image source={{ uri: item }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.productTitle}>{product.name}</Text>

          <View style={styles.brandRatingRow}>
            <Text style={styles.brandLink}>Brand: {product.brand || 'ToyBox'}</Text>
            <View style={styles.dividerDot} />
            <View style={styles.ratingGroup}>
              <Text style={styles.ratingVal}>{product.rating?.toFixed(1) || '0.0'}</Text>
              <Icon name="star" size={14} color="#FFA41C" />
              <Text style={styles.ratingCount}>({product.numReviews || 0})</Text>
            </View>
          </View>

          <View style={styles.priceActionRow}>
            <View style={styles.priceContainer}>
              <Text style={[styles.symbol, { color: colors.text }]}>₹</Text>
              <Text style={[styles.priceMain, { color: colors.text }]}>{Math.floor(product.price)}</Text>
              <Text style={[styles.priceFraction, { color: colors.text }]}>{(product.price % 1).toFixed(2).substring(1)}</Text>
            </View>

            <View style={styles.rightActionArea}>
              <View style={styles.compactQtyPicker}>
                <TouchableOpacity style={styles.qtyBtnAction} onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
                  <Icon name="minus" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyDisplay, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtnAction} onPress={() => setQuantity(quantity + 1)}>
                  <Icon name="plus" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.compactAddBtn} onPress={handleAddToCart}>
                <Text style={styles.compactAddText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.lineDivider} />

          {/* Safety Information Section */}
          {(product.smallPartsWarning || product.safetyWarningText || product.ageRangeDescription) && (
            <>
              <View style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                  <Icon name="alert-circle-outline" size={20} color="#D32F2F" />
                  <Text style={styles.safetyTitle}>Safety Information</Text>
                </View>
                {product.ageRangeDescription && (
                  <Text style={styles.safetyAge}>
                    <Text style={{ fontWeight: 'bold' }}>Recommended Age: </Text>
                    {product.ageRangeDescription}
                  </Text>
                )}
                {product.smallPartsWarning && (
                  <View style={styles.warningRow}>
                    <Icon name="skull-crossbones" size={16} color="#D32F2F" />
                    <Text style={styles.warningText}>CHOKING HAZARD - Small parts. Not for children under 3 years.</Text>
                  </View>
                )}
                {product.safetyWarningText && (
                  <Text style={styles.safetyText}>{product.safetyWarningText}</Text>
                )}
              </View>
              <View style={styles.lineDivider} />
            </>
          )}

          <Text style={styles.sectionLabel}>About this item</Text>
          <Text style={styles.descContent}>{product.description}</Text>

          <View style={styles.lineDivider} />

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Customer Reviews</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                <Text style={styles.writeReviewBtn}>Write a review</Text>
              </TouchableOpacity>
            </View>

            {product.numReviews > 0 ? (
              product.reviews?.map((review: any, index: number) => (
                <View key={review._id || index} style={styles.reviewItem}>
                  <View style={styles.reviewUserRow}>
                    <Text style={styles.reviewUserName}>{review.name}</Text>
                    <View style={styles.ratingGroup}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Icon key={s} name={s <= review.rating ? "star" : "star-outline"} size={12} color="#FFA41C" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>No reviews yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10 }]}>
        <CustomButton title="Buy Now" onPress={handleBuyNow} style={styles.buyBtn} />
      </View>

      {/* Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.ratingPicker}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                    <Icon name={star <= userRating ? "star" : "star-outline"} size={40} color="#FFA41C" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Your thoughts..."
                placeholderTextColor={colors.gray}
                multiline
                value={userComment}
                onChangeText={setUserComment}
              />
              <CustomButton title="Submit" onPress={submitReview} loading={submittingReview} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  staticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: insets.top + 10,
    paddingBottom: 10,
    backgroundColor: colors.card,
    ...SHADOWS.light,
  },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  headerActionBtn: { padding: 5 },
  galleryWrapper: { backgroundColor: colors.card, paddingBottom: 10 },
  mainImageContainer: { width: width, height: 300, position: 'relative' },
  mainSlide: { width: width, height: '100%', justifyContent: 'center', alignItems: 'center' },
  imageMain: { width: '90%', height: '90%' },
  badgeCounter: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  textCounter: { color: 'white', fontSize: 11, fontWeight: '700' },
  thumbScroll: { paddingHorizontal: 15 },
  thumbItem: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: 10, overflow: 'hidden' },
  activeThumbItem: { borderColor: colors.primary, borderWidth: 2 },
  thumbImage: { width: '100%', height: '100%' },
  infoContent: { padding: 15 },
  productTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  brandRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  brandLink: { color: colors.primary, fontSize: 13 },
  dividerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray, marginHorizontal: 10 },
  ratingGroup: { flexDirection: 'row', alignItems: 'center' },
  ratingVal: { fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 4 },
  ratingCount: { fontSize: 12, color: colors.gray, marginLeft: 5 },
  priceActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  symbol: { fontSize: 14, marginTop: 4 },
  priceMain: { fontSize: 28, fontWeight: 'bold' },
  priceFraction: { fontSize: 14, marginTop: 4 },
  rightActionArea: { flexDirection: 'row', alignItems: 'center' },
  compactQtyPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 10, marginRight: 10 },
  qtyBtnAction: { padding: 8 },
  qtyDisplay: { paddingHorizontal: 10, fontWeight: 'bold' },
  compactAddBtn: { backgroundColor: colors.secondary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10 },
  compactAddText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  safetyCard: {
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  safetyAge: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  lineDivider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  descContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  reviewsSection: { marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  writeReviewBtn: { color: colors.primary, fontWeight: 'bold' },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 15, marginBottom: 15 },
  reviewUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  reviewUserName: { fontWeight: 'bold', color: colors.text },
  reviewComment: { color: colors.textSecondary, fontSize: 14 },
  noReviews: { textAlign: 'center', color: colors.gray, paddingVertical: 20 },
  bottomActions: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: colors.card, padding: 15, borderTopWidth: 1, borderTopColor: colors.border, ...SHADOWS.medium },
  buyBtn: { borderRadius: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  reviewModalContainer: { backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  modalContent: { gap: 20 },
  ratingPicker: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  commentInput: { backgroundColor: colors.lightGray, borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', color: colors.text },
  fullScreenModal: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 50, right: 25 },
  fullScreenImage: { width: width, height: '80%' },
});

export default ProductDetailScreen;
