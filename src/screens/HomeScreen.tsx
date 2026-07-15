import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
  StatusBar,
  Modal,
  Animated,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearRecentlyViewed } from '../redux/slices/productSlice';
import { fetchAppConfig } from '../redux/slices/configSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';
import { Product, Banner, User } from '../types';
import HomeHeader from '../components/home/HomeHeader';
import BannerCarousel from '../components/home/BannerCarousel';
import ProductCard from '../components/ProductCard';
import Logo from '../components/common/Logo';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // All Hooks at the top
  const user = useSelector((state: RootState) => state.auth?.user) as User | null;
  const { products = [], recentlyViewed = [] } = useSelector((state: RootState) => state.products) || {};
  const { banners = [], categories = [] } = useSelector((state: RootState) => state.config) || {};
  const cartItems = useSelector((state: RootState) => state.cart?.items ?? []);
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items ?? []);

  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);

  const scrollY = useRef(new Animated.Value(0)).current;

  const filterParams = route.params;

  useEffect(() => {
    let filtered = products;
    if (activeCategory !== 'All') {
      filtered = products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    setDisplayProducts(filtered);
  }, [products, activeCategory]);

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  const loadData = useCallback(async () => {
    dispatch(fetchProducts(filterParams));
    dispatch(fetchAppConfig());
  }, [dispatch, filterParams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSearch = useCallback((text: string) => {
    if (!text.trim()) {
      setDisplayProducts(products);
      return;
    }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(text.toLowerCase())
    );
    setDisplayProducts(filtered);
  }, [products]);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const isWishlisted = useCallback((id: string) => wishlistItems.some(item => (item.id || (item as any)._id) === id), [wishlistItems]);

  const renderStickyHeader = () => {
    return (
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.logoContainer}
          >
            <Logo size={28} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={22} color={colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInputSticky}
              placeholder="Search ToyBox..."
              placeholderTextColor={colors.gray}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
            <View>
              <Icon name="cart" size={28} color={COLORS.white} />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Address' })}
        >
          <Icon name="map-marker-outline" size={18} color={COLORS.white} />
          <Text style={styles.locationText} numberOfLines={1}>
            Deliver to {user?.name || 'Guest'} - {user?.address?.city || 'Set Location'}
          </Text>
          <Icon name="chevron-down" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryIcons = () => {
    const categoryData = [
      { name: 'Deals', icon: 'tag-heart', color: '#FF6B6B' },
      { name: 'New', icon: 'star-circle', color: '#4D94FF' },
      { name: 'Action', icon: 'robot-outline', color: '#FF9F43' },
      { name: 'Puzzles', icon: 'puzzle-outline', color: '#1DD1A1' },
      { name: 'Dolls', icon: 'face-woman-outline', color: '#FF6B6B' },
      { name: 'Learning', icon: 'school-outline', color: '#54A0FF' },
    ];

    return (
      <View style={styles.catIconWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catIconScroll}>
          {categoryData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.catIconItem}
              onPress={() => navigation.navigate('CategoryProducts', { categoryName: item.name })}
            >
              <View style={styles.catIconCircle}>
                <Icon name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.catIconText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecentlyViewed = () => {
    if (recentlyViewed.length === 0) return null;

    return (
      <View style={styles.dealsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.dealsTitle}>Recently Viewed</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentlyViewed')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsScroll}>
          {recentlyViewed.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dealCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <Image source={{ uri: item.image }} style={styles.dealImage} />
              <View style={styles.dealBadge}>
                <Text style={styles.dealBadgeText}>Viewed</Text>
              </View>
              <Text style={styles.dealPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      onAddToCart={() => {
        dispatch(addToCart({ ...item, quantity: 1 }));
        showToast('Added to cart', 'success');
      }}
      isWishlisted={isWishlisted(item.id || (item as any)._id)}
      onWishlistPress={() => dispatch(toggleWishlist(item))}
    />
  ), [dispatch, isWishlisted, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {renderStickyHeader()}

      <Animated.FlatList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        data={products}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 110 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {renderCategoryIcons()}
            <BannerCarousel banners={banners as Banner[]} />
            {renderRecentlyViewed()}
            <View style={styles.sectionHeaderWide}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
            </View>
          </>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
  },
  logoContainer: {
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 65,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 15,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInputSticky: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  cameraIcon: {
    marginLeft: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  catIconWrapper: {
    backgroundColor: colors.card,
    marginTop: 10,
  },
  catIconScroll: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  catIconItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 65,
  },
  catIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  catIconText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  dealsSection: {
    backgroundColor: colors.card,
    marginVertical: 10,
    paddingVertical: 20,
    borderRadius: 25,
    marginHorizontal: 10,
    ...SHADOWS.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionHeaderWide: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  dealsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  dealsScroll: {
    paddingLeft: 20,
  },
  dealCard: {
    marginRight: 15,
    width: 150,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 10,
  },
  dealImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    borderRadius: 15,
  },
  dealBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dealBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 5,
  }
});

export default HomeScreen;
