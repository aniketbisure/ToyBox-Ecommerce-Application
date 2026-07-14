import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  saveForLater,
  moveToCart,
  removeFromSaved,
  syncCart,
  syncSavedItems
} from '../redux/slices/cartSlice';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

const CartScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch();
  const { items = [], savedItems = [], totalAmount = 0 } = useSelector((state: RootState) => state.cart) || {};

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  const renderSavedItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemMainRow}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.itemActionsRow}>
        <TouchableOpacity
          style={styles.proceedBtnSmall}
          onPress={() => {
            dispatch(moveToCart(item.id));
            if (isAuthenticated) {
              const updatedCart = [...items, { ...item, quantity: 1 }];
              const updatedSaved = savedItems.filter(i => i.id !== item.id);
              dispatch(syncCart(updatedCart));
              dispatch(syncSavedItems(updatedSaved));
            }
            showToast('Moved to cart', 'success');
          }}
        >
          <Text style={styles.proceedBtnTextSmall}>Move to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionTextBtn} onPress={() => {
          dispatch(removeFromSaved(item.id));
          if (isAuthenticated) {
            const updatedSaved = savedItems.filter(i => i.id !== item.id);
            dispatch(syncSavedItems(updatedSaved));
          }
        }}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemMainRow}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
        >
          <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
          <Text style={styles.stockText}>In Stock</Text>
          <Text style={styles.shippingText}>Eligible for FREE Shipping</Text>
        </View>
      </View>

      <View style={styles.itemActionsRow}>
        <View style={styles.qtyPicker}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              if (item.quantity > 1) {
                dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                if (isAuthenticated) {
                  const updatedCart = items.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
                  dispatch(syncCart(updatedCart));
                }
              }
            }}
          >
            <Icon name="minus" size={18} color="#111" />
          </TouchableOpacity>
          <View style={styles.qtyValueContainer}>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
          </View>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
              if (isAuthenticated) {
                const updatedCart = items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                dispatch(syncCart(updatedCart));
              }
            }}
          >
            <Icon name="plus" size={18} color="#111" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionTextBtn} onPress={() => {
          dispatch(removeFromCart(item.id));
          if (isAuthenticated) {
            const updatedCart = items.filter(i => i.id !== item.id);
            dispatch(syncCart(updatedCart));
          }
        }}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionTextBtn} onPress={() => {
          dispatch(saveForLater(item.id));
          if (isAuthenticated) {
            const updatedCart = items.filter(i => i.id !== item.id);
            const updatedSaved = [...savedItems, item];
            dispatch(syncCart(updatedCart));
            dispatch(syncSavedItems(updatedSaved));
          }
          showToast('Saved for later', 'info');
        }}>
          <Text style={styles.actionText}>Save for later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="cart-off" size={80} color={COLORS.primary} opacity={0.2} />
          </View>
          <Text style={styles.emptyTitle}>Your ToyBox Cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Time to fill it with some fun! Check out our latest arrivals and deals.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id || item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.header}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal </Text>
                <Text style={styles.subtotalAmount}>₹{totalAmount.toLocaleString()}</Text>
              </View>

              <View style={styles.emiInfo}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.emiText}>Your order is eligible for FREE Delivery.</Text>
              </View>

              <TouchableOpacity style={styles.proceedBtn} onPress={handleCheckout}>
                <Text style={styles.proceedBtnText}>Proceed to Buy ({items.length} items)</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={
          savedItems.length > 0 ? (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Saved for later ({savedItems.length} items)</Text>
              <FlatList
                data={savedItems}
                renderItem={renderSavedItem}
                keyExtractor={(item) => 'saved-' + item.id}
                scrollEnabled={false}
              />
            </View>
          ) : <View style={{ height: 100 }} />
        }
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.light,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  subtotalLabel: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  subtotalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emiText: {
    fontSize: 13,
    color: COLORS.success,
    marginLeft: 8,
    fontWeight: '600',
  },
  proceedBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  proceedBtnText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '700',
  },
  list: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  cartItem: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    ...SHADOWS.light,
  },
  itemMainRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 90,
    height: 90,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '85%',
    height: '85%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginBottom: 2,
  },
  shippingText: {
    fontSize: 12,
    color: colors.gray,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  qtyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    height: 36,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  qtyValueContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  actionTextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  savedSection: {
    padding: 20,
    marginTop: 20,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 15,
  },
  proceedBtnSmall: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  proceedBtnTextSmall: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  shopBtnText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '800',
  },
});

export default CartScreen;
