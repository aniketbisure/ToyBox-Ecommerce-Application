import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { FONTS } from '../../constants/theme';

const Logo = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Icon name="toy-brick-outline" size={32} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>ToyBox</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...FONTS.h2,
    marginLeft: 8,
    fontSize: 22,
    fontWeight: '900',
  },
});

export default Logo;
