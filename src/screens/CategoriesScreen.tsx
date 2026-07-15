import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const CategoriesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const bottomTabHeight = Platform.OS === 'ios' ? 85 : 70;
  const { categories, ageRanges } = useSelector((state: RootState) => state.config);
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All Toys');
  const [searchQuery, setSearchQuery] = useState('');

  const subCategories = useMemo(() => {
    const subs = new Set<string>();
    products.forEach(p => {
      if (p.subCategory) subs.add(p.subCategory);
      // Fallback to category if subCategory is missing
      else if (p.category) subs.add(p.category);
    });
    return Array.from(subs).sort();
  }, [products]);

  const sidebarItems = [
    { id: '1', name: 'All Toys', icon: 'toy-brick-outline', color: COLORS.primary },
    ...subCategories.map((sub, i) => ({ id: (i + 2).toString(), name: sub, icon: 'tag-outline', color: colors.text }))
  ];

  const categoryProducts = products.filter(p => {
    const matchesSubCategory = selectedSubCategory === 'All Toys' ||
      p.subCategory === selectedSubCategory ||
      p.category === selectedSubCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubCategory && matchesSearch;
  });

  const handleAgeRangePress = (ageRange: any) => {
    navigation.navigate('HomeTab', {
      screen: 'HomeScreen',
      params: { minAge: ageRange.minAge, maxAge: ageRange.maxAge, title: ageRange.name }
    });
  };

  const renderSidebarItem = ({ item }: any) => {
    const isActive = selectedSubCategory === item.name;
    return (
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          isActive && styles.activeSidebarItem
        ]}
        onPress={() => setSelectedSubCategory(item.name)}
      >
        <View style={[
          styles.iconCircle,
          isActive && { backgroundColor: item.color + '15' },
          item.name === 'All Toys' && !isActive && { backgroundColor: COLORS.primary + '10' }
        ]}>
          <Icon
            name={item.icon}
            size={24}
            color={isActive ? item.color : (item.name === 'All Toys' ? COLORS.primary : colors.gray)}
          />
        </View>
        <Text style={[
          styles.sidebarText,
          isActive && { color: item.color, fontWeight: '800' },
          item.name === 'All Toys' && !isActive && { color: COLORS.primary }
        ]} numberOfLines={2}>
          {item.name}
        </Text>
        {isActive && <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Toy Categories</Text>
        <View style={styles.headerActions}>
          <View style={styles.miniSearch}>
            <Icon name="magnify" size={20} color={colors.gray} />
            <TextInput
              style={styles.miniSearchInput}
              placeholder="Search..."
              placeholderTextColor={colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="microphone-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.mainContent, { paddingBottom: bottomTabHeight }]}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={sidebarItems}
            renderItem={renderSidebarItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text style={styles.sectionTitle}>{selectedSubCategory} Collection</Text>
          <View style={styles.grid}>
            {categoryProducts.map((item, i) => (
              <TouchableOpacity
                key={item.id || i}
                style={styles.gridItemLarge}
                onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
              >
                <View style={styles.largeItemImage}>
                  <Image source={{ uri: item.image }} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                </View>
                <Text style={styles.itemLabel} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemLabel, { fontWeight: 'bold', color: COLORS.primary }]}>₹{item.price}</Text>
              </TouchableOpacity>
            ))}
            {categoryProducts.length === 0 && (
              <View style={{ flex: 1, alignItems: 'center', marginTop: 40 }}>
                <Icon name="toy-brick-outline" size={40} color={colors.lightGray} />
                <Text style={{ ...FONTS.caption, marginTop: 10, color: colors.textSecondary }}>No products in this category</Text>
              </View>
            )}
          </View>

          {selectedSubCategory === 'All Toys' && ageRanges && ageRanges.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Shop by Age</Text>
              <View style={styles.grid}>
                {ageRanges.map((age: any, i: number) => (
                  <TouchableOpacity
                    key={age._id || i}
                    style={styles.gridItemLarge}
                    onPress={() => handleAgeRangePress(age)}
                  >
                    <View style={styles.largeItemImage}>
                      <Icon name={age.icon || "baby-face-outline"} size={40} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.itemLabel}>{age.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 22,
    marginBottom: 12,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    color: colors.text,
    marginLeft: 8,
  },
  headerIcon: {
    marginLeft: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    backgroundColor: colors.lightGray,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  activeSidebarItem: {
    backgroundColor: colors.card,
    borderLeftColor: COLORS.primary,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sidebarText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: 16,
    marginBottom: 15,
    marginTop: 5,
    color: colors.text,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemLarge: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  largeItemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
});

export default CategoriesScreen;
