import React, { useState } from 'react';
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
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const CategoriesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const bottomTabHeight = Platform.OS === 'ios' ? 85 : 70;
  const { categories, ageRanges } = useSelector((state: RootState) => state.config);
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('All Toys');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { id: '1', name: 'All Toys', icon: 'toy-brick-outline', color: COLORS.primary },
    ...categories.map((c, i) => ({ id: (i + 2).toString(), name: c, icon: 'tag-outline', color: COLORS.text }))
  ];

  const categoryProducts = products.filter(p => {
    const pCat = (p.category || '').trim().toLowerCase();
    const sCat = selectedCategory.trim().toLowerCase();

    const matchesCategory = selectedCategory === 'All Toys' || pCat === sCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAgeRangePress = (ageRange: any) => {
    navigation.navigate('HomeTab', {
      screen: 'HomeScreen',
      params: { minAge: ageRange.minAge, maxAge: ageRange.maxAge, title: ageRange.name }
    });
  };

  const renderSidebarItem = ({ item }: any) => {
    const isActive = selectedCategory === item.name;
    return (
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          isActive && styles.activeSidebarItem
        ]}
        onPress={() => setSelectedCategory(item.name)}
      >
        <View style={[
          styles.iconCircle,
          isActive && { backgroundColor: item.color + '15' },
          item.name === 'All Toys' && !isActive && { backgroundColor: COLORS.primary + '10' }
        ]}>
          <Icon
            name={item.icon}
            size={24}
            color={isActive ? item.color : (item.name === 'All Toys' ? COLORS.primary : COLORS.gray)}
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Toy Categories</Text>
        <View style={styles.headerActions}>
          <View style={styles.miniSearch}>
            <Icon name="magnify" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.miniSearchInput}
              placeholder="Search..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="microphone-outline" size={24} color={COLORS.text} />
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
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={styles.sectionTitle}>{selectedCategory} Collection</Text>
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
                <Icon name="toy-brick-outline" size={40} color={COLORS.lightGray} />
                <Text style={{ ...FONTS.caption, marginTop: 10 }}>No products in this category</Text>
              </View>
            )}
          </View>

          {selectedCategory === 'All Toys' && ageRanges && ageRanges.length > 0 && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 22,
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D5D9D9',
  },
  miniSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    color: COLORS.text,
    marginLeft: 8,
  },
  headerIcon: {
    marginLeft: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F2',
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    backgroundColor: '#F7F8F9',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  activeSidebarItem: {
    backgroundColor: COLORS.white,
    borderLeftColor: COLORS.primary,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sidebarText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    color: '#565959',
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: 16,
    marginBottom: 15,
    marginTop: 5,
    color: COLORS.text,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemLarge: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  largeItemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F7F8F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 2,
  },
});

export default CategoriesScreen;
