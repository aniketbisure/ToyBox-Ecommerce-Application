import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS, FONTS } from '../../constants/theme';
import { showToast } from '../../utils/toastService';
import { User } from '../../types';
import Logo from '../common/Logo';
import { useTheme } from '../../hooks/useTheme';

const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onLocationPress }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Logo size={35} />
        <TouchableOpacity
          style={styles.coinContainer}
          onPress={() => showToast(`ToyBox Points: ${user?.name ? '50' : '0'}`, 'info')}
        >
          <Icon name="wallet-giftcard" size={16} color={colors.white} />
          <Text style={styles.coinText}>{user?.name ? '50' : '0'} pts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.locationContainer}
        onPress={onLocationPress}
      >
        <Icon name="map-marker-radius" size={18} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          Deliver to: <Text style={{ fontWeight: '700' }}>
            {user?.address?.city ? `${user.address.city}, ${user.address.zip}` : 'Mumbai, 400001'}
          </Text>
        </Text>
        <Icon name="chevron-down" size={18} color={colors.gray} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    ...SHADOWS.light,
  },
  locationText: {
    fontSize: 12,
    color: colors.text,
    marginHorizontal: 5,
    ...FONTS.body,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  coinText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
    marginLeft: 5,
  },
});

export default HomeHeader;
