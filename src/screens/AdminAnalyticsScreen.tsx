import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const AdminAnalyticsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mostViewed, setMostViewed] = useState<any[]>([]);
  const [mostSaved, setMostSaved] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      const [viewedRes, savedRes] = await Promise.all([
        apiClient.get('/admin/analytics/most-viewed'),
        apiClient.get('/admin/analytics/most-saved')
      ]);
      setMostViewed(viewedRes.data);
      setMostSaved(savedRes.data);
    } catch (error) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const renderProductRank = (product: any, index: number, total: number, type: 'view' | 'save') => {
    const percentage = total > 0 ? (product.count / total) * 100 : 0;
    const barWidth = (width - moderateScale(100)) * (product.count / (type === 'view' ? mostViewed[0]?.count : mostSaved[0]?.count || 1));

    return (
      <View key={product._id} style={styles.rankRow}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
        <View style={styles.rankContent}>
          <View style={styles.rankTextRow}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.countText}>{product.count} {type === 'view' ? 'views' : 'saves'}</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={[styles.bar, { width: Math.max(barWidth, 10), backgroundColor: type === 'view' ? '#4ECDC4' : '#FF6B6B' }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="eye-outline" size={24} color="#4ECDC4" />
                <Text style={styles.sectionTitle}>Most Viewed Products</Text>
              </View>
              <View style={styles.card}>
                {mostViewed.length > 0 ? (
                  mostViewed.map((item, index) => renderProductRank(item, index, 0, 'view'))
                ) : (
                  <Text style={styles.emptyText}>No data available yet</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="heart-outline" size={24} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Most Saved For Later</Text>
              </View>
              <View style={styles.card}>
                {mostSaved.length > 0 ? (
                  mostSaved.map((item, index) => renderProductRank(item, index, 0, 'save'))
                ) : (
                  <Text style={styles.emptyText}>No data available yet</Text>
                )}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Icon name="information-outline" size={20} color={colors.gray} />
              <Text style={styles.infoText}>
                This data helps you understand which products have the highest purchase intent. Consider offering discounts or featuring "Most Saved" products on the home screen.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  scrollContent: { padding: 20 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { ...FONTS.h3, marginLeft: 10, color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rankNumber: {
    ...FONTS.h2,
    fontSize: 18,
    color: colors.gray,
    width: 30,
    textAlign: 'center'
  },
  rankContent: { flex: 1, marginLeft: 10 },
  rankTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  productName: { ...FONTS.body, fontWeight: '600', color: colors.text, flex: 1 },
  countText: { ...FONTS.caption, color: colors.gray, marginLeft: 10 },
  barContainer: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden'
  },
  bar: { height: '100%', borderRadius: 4 },
  emptyText: { textAlign: 'center', color: colors.gray, paddingVertical: 20 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 15,
    alignItems: 'flex-start',
    marginTop: 10
  },
  infoText: {
    ...FONTS.caption,
    color: colors.gray,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18
  }
});

export default AdminAnalyticsScreen;
