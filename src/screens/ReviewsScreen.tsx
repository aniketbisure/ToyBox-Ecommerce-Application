import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Review } from '../types';

const ReviewsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.productName}>{item.product}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Icon key={s} name="star" size={16} color={s <= item.rating ? '#FFD700' : colors.lightGray} />
              ))}
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Icon name="star-outline" size={60} color={colors.lightGray} />
            <Text style={{ ...FONTS.body, color: colors.gray, marginTop: 10 }}>You haven't reviewed any products yet.</Text>
          </View>
        }
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  card: { backgroundColor: colors.card, padding: 15, borderRadius: 15, marginBottom: 15, ...SHADOWS.light },
  productName: { ...FONTS.h3, fontSize: 16, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  date: { ...FONTS.caption, color: colors.gray, marginLeft: 10 },
  comment: { ...FONTS.body, color: colors.text, fontSize: 14 }
});

export default ReviewsScreen;

export default ReviewsScreen;
