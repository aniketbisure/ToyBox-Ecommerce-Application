import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const CategoriesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { categories, ageRanges } = useSelector((state: RootState) => state.config);
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('All Toys');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { id: '1', name: 'All Toys', icon: 'toy-brick-outline', color: COLORS.primary },
    ...categories.map((c, i) => ({ id: (i + 2).toString(), name: c, icon: 'tag-outline', color: COLORS.text }))
  ];

  const categoryProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All Toys' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAgeRangePress = (ageRange: any) => {
    navigation.navigate('HomeTab', {
      screen: 'Home',
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

      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={sidebarItems}
            renderItem={renderSidebarItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            indicatorStyle="black"
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          indicatorStyle="black"
          contentContainerStyle={{ paddingBottom: 100 }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 10,
    height: 36,
  },
  miniSearchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
    color: COLORS.text,
  },
  headerIcon: {
    marginLeft: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#F8F9FD',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 18,
    position: 'relative',
  },
  activeSidebarItem: {
    backgroundColor: COLORS.white,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: 8,
  },
  activeIconCircle: {
    backgroundColor: COLORS.primary + '15',
  },
  sidebarText: {
    ...FONTS.caption,
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeSidebarText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: 18,
    marginBottom: 15,
    marginTop: 5,
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOWS.light,
  },
  itemLabel: {
    ...FONTS.caption,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text,
  },
  gridItemLarge: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    ...SHADOWS.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  largeItemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  notifyBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 5,
  },
  notifyText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  }
});

export default CategoriesScreen;
