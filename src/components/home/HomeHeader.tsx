import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { showToast } from '../../utils/toastService';
import { User } from '../../types';

interface HomeHeaderProps {
  user: User | null;
  onLocationPress: () => void;
}

import { useTheme } from '../../hooks/useTheme';

const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onLocationPress }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.locationContainer}>
      <TouchableOpacity
        style={styles.locationLeft}
        onPress={onLocationPress}
      >
        <Icon name="map-marker-outline" size={18} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          Deliver to: <Text style={{ fontWeight: '700' }}>
            {user?.address?.city ? `${user.address.city}, ${user.address.zip}` : 'Mumbai, 400001'}
          </Text>
        </Text>
        <Icon name="chevron-down" size={18} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.coinContainer}
        onPress={() => showToast(`ToyBox Points: ${user?.name ? '50' : '0'}`, 'info')}
      >
        <Icon name="wallet-giftcard" size={16} color={colors.white} />
        <Text style={styles.coinText}>{user?.name ? '50' : '0'} pts</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: colors.text,
    marginHorizontal: 5,
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
