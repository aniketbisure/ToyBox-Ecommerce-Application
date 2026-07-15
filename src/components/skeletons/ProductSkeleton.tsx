import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const ProductSkeleton = () => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View style={[styles.image, { opacity, backgroundColor: colors.lightGray }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.title, { opacity, backgroundColor: colors.lightGray }]} />
        <Animated.View style={[styles.price, { opacity, backgroundColor: colors.lightGray }]} />
        <Animated.View style={[styles.btn, { opacity, backgroundColor: colors.lightGray }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: 12,
  },
  title: {
    height: 15,
    width: '90%',
    borderRadius: 4,
    marginBottom: 8,
  },
  price: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 12,
  },
  btn: {
    height: 35,
    width: '100%',
    borderRadius: 12,
  },
});

export default ProductSkeleton;
