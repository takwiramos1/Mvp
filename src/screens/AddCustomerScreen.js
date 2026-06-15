import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { addCustomer } from '../database/db';
import { useAppContext } from '../context/AppContext';

const AddCustomerScreen = ({ navigation }) => {
  const { triggerRefresh } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter the customer name.');
      return;
    }
    setSaving(true);
    try {
      const id = await addCustomer(name, phone, notes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerRefresh();
      navigation.replace('CustomerDetail', { customerId: id, customerName: name.trim() });
    } catch (err) {
      console.error('AddCustomer error:', err);
      Alert.alert('Error', 'Could not save customer. Please try again.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tendai Moyo"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0771234567"
            placeholderTextColor="#bbb"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="e.g. Regular customer, pays on Fridays"
            placeholderTextColor="#bbb"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            returnKeyType="done"
          />
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Add a phone number to send WhatsApp reminders with one tap
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Add Customer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
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
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#eee',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  tipBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#388E3C',
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: '#00C853',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: '#a5d6a7',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AddCustomerScreen;
