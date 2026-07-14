import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { PaymentMethod } from '../types';
import { showToast } from '../utils/toastService';

const PaymentMethodsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Razorpay / UPI / Cards', icon: 'credit-card', last4: '8890' },
    { id: '2', name: 'HDFC Bank Credit Card', icon: 'card-bulleted-outline', last4: '4242' }
  ]);

  const handleAddMethod = () => {
    // Mock adding a new method
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: 'New Mock Card',
      icon: 'credit-card-plus-outline',
      last4: Math.floor(1000 + Math.random() * 9000).toString()
    };
    setMethods([...methods, newMethod]);
    showToast('Payment method added successfully!', 'success');
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
    showToast('Payment method removed', 'info');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {methods.length > 0 ? (
          methods.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name={item.icon as any} size={28} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.last4}>Ending in •••• {item.last4}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMethod(item.id)}>
                <Icon name="trash-can-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="credit-card-off-outline" size={60} color={colors.gray} />
            <Text style={styles.emptyText}>No payment methods saved yet</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddMethod}>
          <Icon name="plus" size={24} color={colors.primary} />
          <Text style={styles.addBtnText}>Add New Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20, color: colors.text },
  content: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 15, borderRadius: 20, marginBottom: 15, ...SHADOWS.medium },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  name: { ...FONTS.h3, fontSize: 16, color: colors.text },
  last4: { ...FONTS.caption, color: colors.gray },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { ...FONTS.body, color: colors.gray, marginTop: 15 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary + '80', borderRadius: 20, marginTop: 10 },
  addBtnText: { ...FONTS.h3, color: colors.primary, marginLeft: 10 }
});

export default PaymentMethodsScreen;
