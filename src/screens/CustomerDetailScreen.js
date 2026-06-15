import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getCustomerById, getTransactionsByCustomer, deleteTransaction, deleteCustomer } from '../database/db';
import { useAppContext } from '../context/AppContext';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import { formatCurrency, getInitials, getAvatarColor } from '../utils/formatters';
import { sendWhatsAppReminder, callCustomer, sendSMSReminder } from '../utils/whatsapp';

const CustomerDetailScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { triggerRefresh, businessName } = useAppContext();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [c, txs] = await Promise.all([
        getCustomerById(customerId),
        getTransactionsByCustomer(customerId),
      ]);
      setCustomer(c);
      setTransactions(txs);
      navigation.setOptions({ title: c?.name ?? 'Customer' });
    } catch (err) {
      console.error('CustomerDetail error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteTransaction = (txId) => {
    Alert.alert('Delete Transaction', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          triggerRefresh();
          loadData();
        },
      },
    ]);
  };

  const handleDeleteCustomer = () => {
    Alert.alert(
      'Delete Customer',
      `Delete ${customer?.name} and all their transactions? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomer(customerId);
            triggerRefresh();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleWhatsApp = async () => {
    if (!customer) return;
    const balance = parseFloat(customer.balance) || 0;
    if (balance <= 0) {
      Alert.alert('No Balance', `${customer.name} has no outstanding balance.`);
      return;
    }
    const sent = await sendWhatsAppReminder(customer.name, balance, customer.phone, businessName);
    if (!sent) {
      Alert.alert('WhatsApp Not Found', 'Could not open WhatsApp. Is it installed?');
    }
  };

  const handleCall = async () => {
    if (!customer?.phone) {
      Alert.alert('No Phone', 'This customer has no phone number saved.');
      return;
    }
    await callCustomer(customer.phone);
  };

  const handleSMS = async () => {
    if (!customer?.phone) {
      Alert.alert('No Phone', 'This customer has no phone number saved.');
      return;
    }
    const balance = parseFloat(customer.balance) || 0;
    await sendSMSReminder(customer.name, balance, customer.phone);
  };

  if (!customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  const balance = parseFloat(customer.balance) || 0;
  const isOwed = balance > 0;
  const initials = getInitials(customer.name);
  const avatarColor = getAvatarColor(customer.name);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#00C853']} />
        }
      >
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: isOwed ? '#FFF3F3' : '#F0FFF4' }]}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone ? (
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          ) : null}
          <Text style={[styles.balanceLabel, { color: isOwed ? '#E53935' : '#00C853' }]}>
            {isOwed ? 'Owes you' : 'All settled'}
          </Text>
          <Text style={[styles.balanceAmount, { color: isOwed ? '#E53935' : '#00C853' }]}>
            {formatCurrency(Math.abs(balance))}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
            <View style={[styles.actionIcon, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSMS}>
            <View style={[styles.actionIcon, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="call-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('EditCustomer', { customer })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8E24AA' }]}>
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Record Buttons */}
        <View style={styles.recordRow}>
          <TouchableOpacity
            style={[styles.recordBtn, { backgroundColor: '#E53935' }]}
            onPress={() => navigation.navigate('AddTransaction', { customerId, type: 'credit', customerName: customer.name })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.recordBtnText}>Give Credit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recordBtn, { backgroundColor: '#00C853' }]}
            onPress={() => navigation.navigate('AddTransaction', { customerId, type: 'payment', customerName: customer.name })}
          >
            <Ionicons name="cash-outline" size={18} color="#fff" />
            <Text style={styles.recordBtnText}>Got Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>
            Transaction History ({transactions.length})
          </Text>
          {transactions.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No transactions"
              subtitle="Record the first credit or payment for this customer"
            />
          ) : (
            transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onDelete={handleDeleteTransaction}
              />
            ))
          )}
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteCustomerBtn} onPress={handleDeleteCustomer}>
          <Ionicons name="trash-outline" size={16} color="#E53935" />
          <Text style={styles.deleteCustomerText}>Delete Customer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  recordRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  recordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  recordBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deleteCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  deleteCustomerText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomerDetailScreen;
