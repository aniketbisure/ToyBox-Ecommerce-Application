import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';

import { moderateScale, scale, verticalScale } from '../utils/responsive';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
  };
  onPress: () => void;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
  onWishlistPress?: () => void;
}


const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onPress,
  onAddToCart,
  isWishlisted = false,
  onWishlistPress
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={onWishlistPress}
        >
          <Icon
            name={isWishlisted ? "heart" : "heart-outline"}
            size={20}
            color={isWishlisted ? colors.primary : colors.gray}
          />
        </TouchableOpacity>
        {product.rating && (
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color={colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToCart}
          >
            <Icon name="plus" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius,
    marginBottom: moderateScale(16),
    ...SHADOWS.medium,
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(160),
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: colors.card,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: moderateScale(10),
    left: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...FONTS.caption,
    marginLeft: moderateScale(4),
    fontWeight: '700',
    color: colors.text,
  },
  info: {
    padding: moderateScale(12),
  },
  category: {
    ...FONTS.caption,
    color: colors.gray,
    marginBottom: moderateScale(2),
  },
  name: {
    ...FONTS.h3,
    fontSize: moderateScale(15),
    marginBottom: moderateScale(8),
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...FONTS.h3,
    color: colors.primary,
    fontSize: moderateScale(16),
  },
  addBtn: {
    backgroundColor: colors.secondary,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;
