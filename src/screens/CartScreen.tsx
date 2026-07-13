import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../components/Skeleton';
import { useTheme } from '../hooks/useTheme';

const CartScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);

  const handleCheckout = () => {
    // Navigate to Checkout or trigger Razorpay
    navigation.navigate('CartTab', { screen: 'Checkout' });
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCart());
            showToast('Cart cleared', 'info');
          }
        },
      ]
    );
  };

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 25 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <Skeleton width={90} height={90} borderRadius={SIZES.radius - 4} />
          <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
            <Skeleton width="70%" height={20} />
            <Skeleton width="40%" height={15} style={{ marginTop: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <Skeleton width="30%" height={20} />
              <Skeleton width="30%" height={25} borderRadius={8} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => dispatch(removeFromCart(item.id))}
          >
            <Icon name="trash-can-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemCategory}>Qty: {item.quantity}</Text>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₹{item.price.toFixed(0)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => item.quantity > 1 && dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
            >
              <Icon name="minus" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
            >
              <Icon name="plus" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="cart-outline" size={80} color={colors.lightGray} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
          <CustomButton
            title="Start Shopping"
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.shopBtn}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item: any) => item.id || item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.summaryContainer, { marginBottom: 85, paddingBottom: 25 }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>

            <CustomButton
              title="Checkout Now"
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            />
          </View>
        </>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 10,
    marginBottom: 20,
  },
  title: {
    ...FONTS.h1,
    fontSize: 28,
    color: colors.text,
  },
  clearText: {
    ...FONTS.body,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 25,
    paddingBottom: 110,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  imageContainer: {
    width: 85,
    height: 85,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '85%',
    height: '80%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    ...FONTS.h3,
    fontSize: 15,
    flex: 1,
    marginRight: 5,
    color: colors.text,
  },
  removeBtn: {
    padding: 5,
  },
  itemCategory: {
    ...FONTS.caption,
    color: colors.gray,
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    ...FONTS.h3,
    color: colors.primary,
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    backgroundColor: colors.card,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  quantityText: {
    ...FONTS.body,
    fontWeight: '800',
    marginHorizontal: 12,
    fontSize: 14,
    color: colors.text,
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
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  emptyTitle: {
    ...FONTS.h2,
    marginBottom: 10,
    color: colors.text,
  },
  emptySubtitle: {
    ...FONTS.body,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopBtn: {
    width: '100%',
  },
  summaryContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    ...SHADOWS.dark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    ...FONTS.body,
    color: colors.gray,
  },
  summaryValue: {
    ...FONTS.body,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 15,
  },
  totalLabel: {
    ...FONTS.h3,
    fontSize: 20,
    color: colors.text,
  },
  totalValue: {
    ...FONTS.h2,
    color: colors.primary,
  },
  checkoutBtn: {
    marginTop: 25,
  },
});

export default CartScreen;

export default CartScreen;
