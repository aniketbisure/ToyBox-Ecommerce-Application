import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { moderateScale } from '../utils/responsive';

interface ProductCardProps {
  product: {
    id: string;
    _id?: string;
    name: string;
    price: number;
    listPrice?: number;
    image: string;
    category?: string;
    rating?: number;
    numReviews?: number;
    isPlus?: boolean;
    deliveryDate?: string;
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

  const discount = product.listPrice && product.listPrice > product.price
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={(e) => {
            e.stopPropagation();
            onWishlistPress && onWishlistPress();
          }}
        >
          <Icon
            name={isWishlisted ? "heart" : "heart-outline"}
            size={20}
            color={isWishlisted ? COLORS.primary : '#888'}
          />
        </TouchableOpacity>
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Icon
                key={s}
                name={s <= (product.rating || 0) ? "star" : "star-outline"}
                size={14}
                color={s <= (product.rating || 0) ? "#FFA41C" : "#CCC"}
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>{product.numReviews || 0}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.price}>{product.price.toLocaleString()}</Text>
          {product.listPrice && product.listPrice > product.price && (
            <Text style={styles.mrp}>M.R.P: ₹{product.listPrice.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.deliveryRow}>
          <Icon name="truck-delivery-outline" size={14} color="#007600" />
          <Text style={styles.deliveryText}>FREE delivery <Text style={{fontWeight: '700'}}>Tomorrow</Text></Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart();
          }}
        >
          <Text style={styles.addBtnText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    height: 38,
    lineHeight: 18,
    color: '#333',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currency: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  price: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 1,
  },
  mrp: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    color: '#BBB',
    marginLeft: 6,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryText: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ProductCard;
