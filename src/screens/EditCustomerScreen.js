import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { updateCustomer } from '../database/db';
import { useAppContext } from '../context/AppContext';

const EditCustomerScreen = ({ route, navigation }) => {
  const { customer } = route.params;
  const { triggerRefresh } = useAppContext();
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [notes, setNotes] = useState(customer.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter the customer name.');
      return;
    }
    setSaving(true);
    try {
      await updateCustomer(customer.id, name, phone, notes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerRefresh();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update customer.');
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
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 0771234567"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Any notes about this customer..."
            placeholderTextColor="#bbb"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  saveBtnDisabled: { backgroundColor: '#a5d6a7' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default EditCustomerScreen;
