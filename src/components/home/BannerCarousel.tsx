import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { Banner } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex, banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <View style={styles.bannerWrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id || (item as any)._id}
        renderItem={({ item }) => (
          <View style={[styles.dealsContainer, { width: width - 30, marginHorizontal: 15 }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.bannerImage} />
            ) : (
              <View style={[styles.fallbackBg, { backgroundColor: item.color || colors.primary }]} />
            )}

            {/* Overlay for better text readability */}
            <View style={styles.overlay} />

            <View style={styles.dealsContent}>
              <View style={styles.dealsTextContainer}>
                <Text style={styles.dealsTitle}>{item.title}</Text>
                <Text style={styles.dealsSubtitle}>{item.subtitle}</Text>
                {item.link && (
                  <TouchableOpacity style={[styles.dealsShopBtn, { backgroundColor: colors.white }]}>
                    <Text style={[styles.dealsShopBtnText, { color: item.color || colors.primary }]}>SHOP NOW</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.dealsImageContainer}>
                <Icon name={item.icon || 'gift'} size={80} color="rgba(255,255,255,0.4)" />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    marginVertical: 20,
    height: 160,
  },
  dealsContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    ...SHADOWS.dark,
    height: 160,
    position: 'relative',
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dealsContent: {
    flex: 1,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  dealsTextContainer: {
    flex: 1,
    zIndex: 3,
  },
  dealsTitle: {
    ...FONTS.h1,
    color: '#FFFFFF',
    fontSize: 24,
  },
  dealsSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
    marginVertical: 10,
    fontWeight: '600',
  },
  dealsShopBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  dealsShopBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dealsImageContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
});

export default BannerCarousel;
