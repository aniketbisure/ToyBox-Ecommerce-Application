import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, FONTS, ThemeColors } from '../constants/theme';
import Logo from '../components/common/Logo';
import { useThemedStyles } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Logo size={width * 0.75} />
        <Text style={styles.tagline}>The Ultimate Toy Adventure</Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
        <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: width * 0.75,
    height: width * 0.75,
    resizeMode: 'contain',
  },
  tagline: {
    ...FONTS.body,
    color: colors.gray,
    fontSize: 18,
    marginTop: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  }
});

export default SplashScreen;
