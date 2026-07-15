import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SHADOWS, ThemeColors } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { createSupportTicket, getMyTickets, resetSupportState } from '../redux/slices/supportSlice';
import { showToast } from '../utils/toastService';
import CustomButton from '../components/CustomButton';
import { useTheme, useThemedStyles } from '../hooks/useTheme';

const SupportScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles, [insets]);
  const dispatch = useDispatch<AppDispatch>();

  const { tickets, loading, success, error } = useSelector((state: RootState) => state.support);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'info' | 'tickets'>('info');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'tickets') {
      dispatch(getMyTickets());
    }
  }, [dispatch, isAuthenticated, activeTab]);

  useEffect(() => {
    if (success) {
      showToast('Ticket submitted successfully', 'success');
      setSubject('');
      setMessage('');
      setShowForm(false);
      dispatch(resetSupportState());
    }
    if (error) {
      showToast(error, 'error');
      dispatch(resetSupportState());
    }
  }, [success, error, dispatch]);

  const supportOptions = [
    { title: 'Contact Support', icon: 'headphones', value: '+91 99999-99999', type: 'phone' },
    { title: 'Email Us', icon: 'email-outline', value: 'support@toybox.in', type: 'email' },
    { title: 'FAQ', icon: 'frequently-asked-questions', value: 'Read our common questions', type: 'link' },
    { title: 'Privacy Policy', icon: 'shield-lock-outline', value: 'How we handle your data', type: 'link' },
  ];

  const handleAction = (item: any) => {
    if (item.type === 'phone') Linking.openURL(`tel:${item.value}`);
    else if (item.type === 'email') Linking.openURL(`mailto:${item.value}`);
    else navigation.navigate('HomeTab'); // Placeholder for other links
  };

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }
    dispatch(createSupportTicket({ subject, message }));
  };

  const renderInfo = () => (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={styles.infoCard}>
        <Icon name="information-outline" size={30} color={COLORS.primary} />
        <Text style={styles.infoText}>We are here to help you 24/7. Please reach out to us if you have any issues with your order or account.</Text>
      </View>

      {supportOptions.map((item, index) => (
        <TouchableOpacity key={index} style={styles.optionCard} onPress={() => handleAction(item)}>
          <View style={[styles.iconBg, { backgroundColor: COLORS.primary + '15' }]}>
            <Icon name={item.icon} size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.optionValue}>{item.value}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.gray} />
        </TouchableOpacity>
      ))}

      {isAuthenticated && (
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: COLORS.primary, marginTop: 10 }]}
          onPress={() => setActiveTab('tickets')}
        >
          <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Icon name="message-text-outline" size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.optionTitle, { color: COLORS.white }]}>My Support Tickets</Text>
            <Text style={[styles.optionValue, { color: 'rgba(255,255,255,0.8)' }]}>View status of your requests</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderTickets = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>{showForm ? 'New Ticket' : 'Your Requests'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Icon name={showForm ? "close" : "plus-circle-outline"} size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showForm ? (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="What is this about?"
            placeholderTextColor={colors.gray}
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={[styles.label, { marginTop: 15 }]}>Message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={colors.gray}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <CustomButton
            title="Submit Ticket"
            onPress={handleSubmitTicket}
            loading={loading}
            style={{ marginTop: 30 }}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {loading && tickets.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="message-off-outline" size={60} color={colors.gray + '50'} />
              <Text style={styles.emptyText}>No support tickets found</Text>
              <TouchableOpacity onPress={() => setShowForm(true)} style={{ marginTop: 15 }}>
                <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>Raise a new ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tickets.map((ticket) => (
              <View key={ticket._id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>{ticket.status}</Text>
                  </View>
                </View>
                <Text style={styles.ticketMessage} numberOfLines={2}>{ticket.message}</Text>
                {ticket.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Admin Response:</Text>
                    <Text style={styles.responseText}>{ticket.response}</Text>
                  </View>
                )}
                <Text style={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#3498db';
      case 'IN_PROGRESS': return '#f39c12';
      case 'RESOLVED': return '#2ecc71';
      case 'CLOSED': return '#95a5a6';
      default: return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => {
            if (showForm) setShowForm(false);
            else if (activeTab === 'tickets') setActiveTab('info');
            else navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'info' ? 'Help & Support' : (showForm ? 'New Request' : 'Support Tickets')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {activeTab === 'info' ? renderInfo() : renderTickets()}
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDarkMode: boolean, insets: EdgeInsets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 20,
    color: colors.text,
  },
  infoCard: { backgroundColor: COLORS.primary + '10', padding: 20, borderRadius: 20, marginBottom: 25, flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 15, ...FONTS.body, fontSize: 13, color: colors.textSecondary },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 15, marginBottom: 15, backgroundColor: colors.card, ...SHADOWS.light },
  iconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionTitle: { ...FONTS.h3, fontSize: 16, color: colors.text },
  optionValue: { ...FONTS.body, fontSize: 13, color: colors.gray, marginTop: 2 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 10 },
  sectionTitle: { ...FONTS.h3, fontSize: 18, color: colors.text },
  addBtn: { padding: 5 },
  formContainer: { padding: 20 },
  label: { ...FONTS.body, fontWeight: '700', fontSize: 14, marginBottom: 8, color: colors.text },
  input: { height: 55, borderRadius: 15, paddingHorizontal: 15, ...FONTS.body, fontSize: 15, borderWidth: 1, borderColor: colors.lightGray, backgroundColor: colors.card, color: colors.text },
  textArea: { height: 150, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, ...FONTS.body, fontSize: 15, borderWidth: 1, borderColor: colors.lightGray, backgroundColor: colors.card, color: colors.text },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...FONTS.body, marginTop: 15, color: colors.gray },
  ticketCard: { padding: 18, borderRadius: 18, marginBottom: 15, backgroundColor: colors.card, ...SHADOWS.light },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ticketSubject: { ...FONTS.h4, flex: 1, marginRight: 10, fontSize: 16, color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  ticketMessage: { ...FONTS.body, fontSize: 13, marginBottom: 12, lineHeight: 18, color: colors.gray },
  responseContainer: { backgroundColor: COLORS.primary + '05', padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  responseLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  responseText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  ticketDate: { fontSize: 10, color: colors.gray, alignSelf: 'flex-end' }
});

export default SupportScreen;
