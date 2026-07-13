import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ToastRef {
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Toast = forwardRef<ToastRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('success');
  const opacity = useState(new Animated.Value(0))[0];

  useImperativeHandle(ref, () => ({
    show: (msg, t = 'success') => {
      setMessage(msg);
      setType(t);
      setVisible(true);
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    },
  }));

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      default: return 'information';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity }, SHADOWS.medium]}>
      <View style={[styles.content, { borderLeftColor: getColor() }]}>
        <Icon name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: moderateScale(100),
    left: moderateScale(20),
    right: moderateScale(20),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderLeftWidth: 4,
    borderRadius: moderateScale(8),
  },
  message: {
    ...FONTS.body,
    marginLeft: moderateScale(12),
    color: COLORS.text,
    flex: 1,
  },
});

export default Toast;
