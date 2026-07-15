import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Explore New Toys',
    description: 'Discover the latest and most popular toys for your children in one place.',
    image: 'rocket-launch',
    color: '#FF6B6B'
  },
  {
    id: '2',
    title: 'Safe Payments',
    description: 'We ensure 100% secure payment methods for a worry-free shopping experience.',
    image: 'shield-check',
    color: '#4ECDC4'
  },
  {
    id: '3',
    title: 'Fast Delivery',
    description: 'Get your toys delivered to your doorstep faster than a toy car!',
    image: 'truck-delivery',
    color: '#FFE66D'
  }
];

const OnboardingScreen = ({ navigation, onComplete }: any) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    if (onComplete) {
      onComplete();
    } else {
      navigation.replace('Auth');
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    if (onComplete) {
      onComplete();
    } else {
      navigation.replace('Auth');
    }
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const renderSlide = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={[styles.imageContainer, { backgroundColor: item.color + '20' }]}>
        <Icon name={item.image} size={150} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={skip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled
        data={slides}
        contentContainerStyle={{ height: height * 0.75 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>

        {currentSlideIndex === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleFinish}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={goToNextSlide}
          >
            <Icon name="arrow-right" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: moderateScale(50),
    right: moderateScale(20),
    zIndex: 10,
  },
  skipText: {
    ...FONTS.body,
    color: colors.gray,
    fontWeight: '700',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: moderateScale(250),
    height: moderateScale(250),
    borderRadius: moderateScale(125),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...FONTS.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 15,
    color: colors.text,
  },
  description: {
    ...FONTS.body,
    textAlign: 'center',
    color: colors.gray,
    lineHeight: 24,
  },
  footer: {
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: colors.lightGray,
    marginHorizontal: 3,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 25,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...SHADOWS.medium,
  },
  getStartedBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  getStartedText: {
    ...FONTS.h3,
    color: COLORS.white,
    fontSize: 18,
  }
});

export default OnboardingScreen;
