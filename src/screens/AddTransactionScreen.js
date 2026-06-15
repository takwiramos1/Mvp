import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { addTransaction, getAllCustomers } from '../database/db';
import { useAppContext } from '../context/AppContext';
import { getInitials, getAvatarColor, formatCurrency } from '../utils/formatters';

const COMMON_ITEMS = [
  'Groceries', 'Bread', 'Sugar', 'Cooking Oil', 'Mealie Meal',
  'Airtime', 'Data Bundle', 'Soap', 'Rice', 'Salt',
];

const AddTransactionScreen = ({ route, navigation }) => {
  const { triggerRefresh } = useAppContext();
  const { type: initialType = 'credit', customerId: presetId, customerName: presetName } = route.params ?? {};

  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(presetId ?? null);
  const [selectedCustomerName, setSelectedCustomerName] = useState(presetName ?? '');
  const [customers, setCustomers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCustomers().then(setCustomers).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Select Customer', 'Please choose a customer first.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    setSaving(true);
    try {
      await addTransaction(selectedCustomerId, parsedAmount, type, description);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerRefresh();
      navigation.goBack();
    } catch (err) {
      console.error('AddTransaction error:', err);
      Alert.alert('Error', 'Could not save transaction. Please try again.');
      setSaving(false);
    }
  };

  const isCredit = type === 'credit';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isCredit && styles.toggleBtnActive, isCredit && { backgroundColor: '#E53935' }]}
            onPress={() => setType('credit')}
          >
            <Ionicons name="add-circle-outline" size={18} color={isCredit ? '#fff' : '#999'} />
            <Text style={[styles.toggleText, isCredit && styles.toggleTextActive]}>Give Credit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isCredit && styles.toggleBtnActive, !isCredit && { backgroundColor: '#00C853' }]}
            onPress={() => setType('payment')}
          >
            <Ionicons name="cash-outline" size={18} color={!isCredit ? '#fff' : '#999'} />
            <Text style={[styles.toggleText, !isCredit && styles.toggleTextActive]}>Got Payment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* Customer Selector */}
          <Text style={styles.label}>Customer *</Text>
          <TouchableOpacity
            style={styles.customerSelector}
            onPress={() => !presetId && setShowPicker(true)}
            disabled={!!presetId}
          >
            {selectedCustomerId ? (
              <View style={styles.selectedCustomerRow}>
                <View style={[styles.miniAvatar, { backgroundColor: getAvatarColor(selectedCustomerName) }]}>
                  <Text style={styles.miniAvatarText}>{getInitials(selectedCustomerName)}</Text>
                </View>
                <Text style={styles.selectedCustomerName}>{selectedCustomerName}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Tap to select customer</Text>
            )}
            {!presetId && <Ionicons name="chevron-down" size={18} color="#bbb" />}
          </TouchableOpacity>

          {/* Amount */}
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#bbb"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              returnKeyType="done"
              autoFocus={!!presetId}
            />
          </View>

          {/* Description */}
          <Text style={styles.label}>What for? (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bread, Sugar, Airtime..."
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
          />

          {/* Quick Fill Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {COMMON_ITEMS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.chip}
                onPress={() => setDescription(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Preview */}
        {amount && selectedCustomerName ? (
          <View style={[styles.previewBox, { backgroundColor: isCredit ? '#FFF3F3' : '#F0FFF4' }]}>
            <Text style={[styles.previewText, { color: isCredit ? '#E53935' : '#00C853' }]}>
              {isCredit ? '📤' : '📥'} {isCredit ? 'You gave' : 'You received'}{' '}
              <Text style={styles.previewAmount}>{formatCurrency(parseFloat(amount) || 0)}</Text>
              {description ? ` for "${description}"` : ''}{' '}
              {isCredit ? 'to' : 'from'}{' '}
              <Text style={styles.previewName}>{selectedCustomerName}</Text>
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isCredit ? '#E53935' : '#00C853' }, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : `Record ${isCredit ? 'Credit' : 'Payment'}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Customer Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {customers.length === 0 ? (
              <View style={styles.noCustomers}>
                <Text style={styles.noCustomersText}>No customers yet.</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(false);
                    navigation.navigate('AddCustomer');
                  }}
                >
                  <Text style={styles.addCustomerLink}>+ Add a customer first</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={customers}
                keyExtractor={(c) => String(c.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.customerRow}
                    onPress={() => {
                      setSelectedCustomerId(item.id);
                      setSelectedCustomerName(item.name);
                      setShowPicker(false);
                    }}
                  >
                    <View style={[styles.miniAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
                      <Text style={styles.miniAvatarText}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerRowName}>{item.name}</Text>
                      {item.phone ? <Text style={styles.customerRowPhone}>{item.phone}</Text> : null}
                    </View>
                    {selectedCustomerId === item.id && (
                      <Ionicons name="checkmark-circle" size={22} color="#00C853" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleBtnActive: {},
  toggleText: { fontSize: 14, fontWeight: '600', color: '#aaa' },
  toggleTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCustomerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  selectedCustomerName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  placeholderText: { fontSize: 15, color: '#bbb' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#aaa',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    paddingVertical: 12,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipsRow: { marginTop: 10, marginHorizontal: -2 },
  chip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  chipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  previewBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  previewText: { fontSize: 14, lineHeight: 20 },
  previewAmount: { fontWeight: '800' },
  previewName: { fontWeight: '700' },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  noCustomers: { padding: 32, alignItems: 'center' },
  noCustomersText: { fontSize: 14, color: '#999', marginBottom: 12 },
  addCustomerLink: { fontSize: 14, color: '#00C853', fontWeight: '700' },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  customerRowName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  customerRowPhone: { fontSize: 12, color: '#aaa', marginTop: 1 },
});

export default AddTransactionScreen;
