import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getInitials, getAvatarColor, formatCurrency } from '../utils/formatters';

const CustomerCard = ({ customer, onPress }) => {
  const initials = getInitials(customer.name);
  const avatarColor = getAvatarColor(customer.name);
  const balance = parseFloat(customer.balance) || 0;
  const isOwed = balance > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
        {customer.phone ? (
          <Text style={styles.phone}>{customer.phone}</Text>
        ) : (
          <Text style={styles.noPhone}>No phone number</Text>
        )}
      </View>

      <View style={styles.balanceBox}>
        <Text style={[styles.balance, { color: isOwed ? '#E53935' : '#00C853' }]}>
          {isOwed ? `-${formatCurrency(balance)}` : formatCurrency(0)}
        </Text>
        <Text style={styles.balanceLabel}>{isOwed ? 'owes you' : 'settled'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#888',
  },
  noPhone: {
    fontSize: 12,
    color: '#ccc',
    fontStyle: 'italic',
  },
  balanceBox: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  balance: {
    fontSize: 15,
    fontWeight: '800',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 1,
  },
});

export default CustomerCard;
