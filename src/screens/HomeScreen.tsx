import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Modal
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchAppConfig } from '../redux/slices/configSlice';
import { AppDispatch, RootState } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';
import { Product, Banner, User } from '../types';
import HomeHeader from '../components/home/HomeHeader';
import BannerCarousel from '../components/home/BannerCarousel';

import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user) as User | null;
  const { products, recentlyViewed } = useSelector((state: RootState) => state.products);
  const { banners, categories } = useSelector((state: RootState) => state.config);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTopFilter, setActiveTopFilter] = useState<string | null>(null);
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
  const [isListening, setIsListening] = useState(false);

  // Optimization: Memoize styles to prevent recalculation on every render
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const renderTopMenu = () => (
    <View style={styles.topMenuContainer}>
      {[
        { name: 'New', icon: 'star-face', color: colors.primary },
        { name: 'Birthday', icon: 'muffin', color: colors.secondary },
        { name: 'Deals', icon: 'seal-variant', color: '#FFD93D' },
        { name: 'Offers', icon: 'tag-outline', color: '#6C5CE7' },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.topMenuItem}
          onPress={() => setActiveTopFilter(activeTopFilter === item.name ? null : item.name)}
        >
          <View style={[
            styles.topMenuIconBg,
            { backgroundColor: item.color + '20' },
            activeTopFilter === item.name && { borderWidth: 2, borderColor: item.color }
          ]}>
            <Icon name={item.icon} size={30} color={item.color} />
          </View>
          <Text style={[
            styles.topMenuText,
            activeTopFilter === item.name && { color: item.color, fontWeight: '900' }
          ]}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchBar}>
        <Icon name="magnify" size={22} color={colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for amazing toys..."
          placeholderTextColor={colors.gray}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleVoiceSearch}>
          <Icon name="microphone" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {['All', ...categories].map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.categoryItem, (activeTopFilter === cat || (!activeTopFilter && cat === 'All')) && styles.activeCategoryItem]}
            onPress={() => setActiveTopFilter(cat === 'All' ? null : cat)}
          >
            <Text style={[styles.categoryText, (activeTopFilter === cat || (!activeTopFilter && cat === 'All')) && styles.activeCategoryText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHorizontalSection = () => {
    const displayItems = recentlyViewed.length > 0 ? recentlyViewed : products.slice(0, 5);
    const sectionTitle = recentlyViewed.length > 0
      ? `${user?.name || 'User'}, still looking for these?`
      : 'Popular Picks For You';

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {displayItems.length > 0 ? displayItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modernCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <View style={styles.modernCardImageBg}>
                <Image source={{ uri: item.image }} style={styles.modernCardImage} />
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>₹{item.price}</Text>
                </View>
              </View>
              <Text style={styles.modernCardName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )) : [1, 2, 3].map((i) => (
            <View key={i} style={styles.modernCardPlaceholder}>
              <Icon name="toy-brick-outline" size={30} color={colors.lightGray} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridProductCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image }} style={styles.gridProductImage} />
      </View>
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductCategory}>{item.category}</Text>
        <Text style={styles.gridProductName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.gridFooter}>
          <Text style={styles.gridProductPrice}>₹{item.price}</Text>
          <View style={styles.gridAddBtn}>
            <Icon name="plus" size={16} color={colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [colors.white, navigation, styles]);

  const renderProductList = () => (
    <View style={styles.productListSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeTopFilter ? `${activeTopFilter} Collection` : 'Popular For You'}
        </Text>
        <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
      </View>
      <View style={styles.productGrid}>
        {displayProducts.length > 0 ? (
          displayProducts.map((item, index) => (
            <React.Fragment key={item.id || index}>
              {renderProductItem({ item })}
            </React.Fragment>
          ))
        ) : (
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 40, width: '100%' }}>
            <Icon name="toy-brick-outline" size={60} color={colors.lightGray} />
            <Text style={{ ...FONTS.body, color: colors.gray, marginTop: 10 }}>No toys found</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <Modal visible={isListening} transparent={true} animationType="fade">
        <View style={styles.voiceModalContainer}>
          <View style={styles.voiceContent}>
            <Icon name="microphone" size={50} color={colors.primary} />
            <Text style={styles.voiceText}>Listening for Toy Names...</Text>
            <TouchableOpacity
              style={styles.closeVoiceBtn}
              onPress={() => setIsListening(false)}
            >
              <Text style={styles.closeVoiceText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={displayProducts}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {renderTopMenu()}
            <HomeHeader
              user={user}
              onLocationPress={() => navigation.navigate('ProfileTab', { screen: 'Address' })}
            />
            {renderSearchBar()}
            {renderCategories()}
            <BannerCarousel banners={banners as Banner[]} />
            {renderHorizontalSection()}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTopFilter ? `${activeTopFilter} Collection` : 'Popular For You'}
              </Text>
              <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 40, width: '100%' }}>
            <Icon name="toy-brick-outline" size={60} color={colors.lightGray} />
            <Text style={{ ...FONTS.body, color: colors.gray, marginTop: 10 }}>No toys found</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: insets.top,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  gridProductCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    ...SHADOWS.light,
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridProductImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  gridProductInfo: {
    marginTop: 10,
  },
  gridProductCategory: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gridProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  gridProductPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  gridAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContent: {
    backgroundColor: colors.card,
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
    ...SHADOWS.dark,
  },
  voiceText: {
    ...FONTS.h3,
    marginTop: 20,
    textAlign: 'center',
    color: colors.text,
  },
  closeVoiceBtn: {
    marginTop: 30,
    padding: 10,
  },
  closeVoiceText: {
    ...FONTS.body,
    color: colors.textSecondary,
    fontWeight: '700',
  }
});

export default HomeScreen;
