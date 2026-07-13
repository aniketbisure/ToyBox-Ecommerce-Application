import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="toy-brick" size={120} color={COLORS.primary} />
        </Animated.View>
        <Text style={styles.logoText}>ToyBox</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    ...FONTS.h1,
    fontSize: 48,
    color: COLORS.primary,
    marginTop: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 18,
    marginTop: 5,
    fontWeight: '600',
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
