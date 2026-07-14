import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { showToast } from '../utils/toastService';
import { useTheme } from '../hooks/useTheme';

const StarRating = ({ rating, starSize = 16, color = "#FFD700" }: any) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name={s <= rating ? 'star' : s - 0.5 <= rating ? 'star-half-full' : 'star-outline'}
          size={starSize}
          color={color}
        />
      ))}
    </View>
  );
};

const AdminReviewsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await apiClient.get('/products/admin/reviews');
      setReviews(data);
    } catch (error) {
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleDeleteReview = (productId: string, reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to remove this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
              showToast('Review deleted successfully', 'success');
              setReviews(prev => prev.filter(r => r.id !== reviewId));
            } catch (error) {
              showToast('Failed to delete review', 'error');
            }
          }
        }
      ]
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.name || 'Anonymous User'}</Text>
            <Text style={styles.productName}>on {item.productName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteReview(item.productId, item.id)}>
          <Icon name="trash-can-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.ratingRow}>
        <StarRating
          rating={item.rating}
          starSize={16}
          color="#FFD700"
        />
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Moderation</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="comment-off-outline" size={60} color={colors.gray} />
              <Text style={styles.emptyText}>No reviews found</Text>
            </View>
          }
        />
      )}
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
  list: { padding: 15 },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.medium
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  userName: { ...FONTS.h4, color: colors.text },
  productName: { ...FONTS.caption, color: colors.gray, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  date: { ...FONTS.caption, color: colors.gray },
  comment: { ...FONTS.body, fontSize: 14, color: colors.text, lineHeight: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { ...FONTS.h3, color: colors.gray, marginTop: 15 }
});

export default AdminReviewsScreen;
