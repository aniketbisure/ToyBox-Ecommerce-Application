import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import CustomButton from '../components/CustomButton';

const OrderSuccessScreen = ({ navigation }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Disable back hardware button on Android
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();

    const backAction = () => {
      navigation.navigate('HomeTab');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon name="check-decagram" size={100} color={COLORS.success} />
          </Animated.View>
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your amazing toys are being prepared for delivery. You will receive an email confirmation shortly.
        </Text>

        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Status</Text>
            <Text style={styles.orderValue}>Confirmed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Estimated Delivery</Text>
            <Text style={styles.orderValue}>3-5 Business Days</Text>
          </View>
        </View>

        <CustomButton
          title="Continue Shopping"
          onPress={() => navigation.navigate('HomeTab')}
          style={styles.btn}
        />

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <Text style={styles.trackText}>Track My Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    ...FONTS.h1,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  orderCard: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 40,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    ...FONTS.body,
    color: COLORS.gray,
  },
  orderValue: {
    ...FONTS.h3,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 15,
  },
  btn: {
    width: '100%',
    marginBottom: 20,
  },
  trackBtn: {
    padding: 10,
  },
  trackText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '700',
  }
});

export default OrderSuccessScreen;
