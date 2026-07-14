import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { moderateScale } from '../../utils/responsive';

interface LogoProps {
  size?: number;
  style?: any;
}

const Logo = ({ size = 40, style }: LogoProps) => {
  const scaledSize = moderateScale(size);
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: scaledSize, height: scaledSize, resizeMode: 'contain' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo;
