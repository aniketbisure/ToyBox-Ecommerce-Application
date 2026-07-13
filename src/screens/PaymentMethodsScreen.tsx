import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PaymentMethodsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState([]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {methods.map((item, index) => (
          <View key={index} style={styles.card}>
            <Icon name={item.icon} size={30} color={COLORS.primary} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.last4}>Ending in {item.last4}</Text>
            </View>
            <TouchableOpacity>
              <Icon name="trash-can-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn}>
          <Icon name="plus" size={24} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add New Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { ...FONTS.h2, fontSize: 20 },
  content: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 20, borderRadius: 15, marginBottom: 15, ...SHADOWS.light },
  info: { flex: 1, marginLeft: 15 },
  name: { ...FONTS.h3, fontSize: 16 },
  last4: { ...FONTS.caption, color: COLORS.gray },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 15, marginTop: 10 },
  addBtnText: { ...FONTS.h3, color: COLORS.primary, marginLeft: 10 }
});

export default PaymentMethodsScreen;
