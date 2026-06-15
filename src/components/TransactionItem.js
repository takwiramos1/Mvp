import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionItem = ({ transaction, onDelete }) => {
  const isCredit = transaction.type === 'credit';

  return (
    <View style={styles.item}>
      <View style={[styles.dot, { backgroundColor: isCredit ? '#E53935' : '#00C853' }]} />
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || (isCredit ? 'Goods on credit' : 'Payment received')}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? '#E53935' : '#00C853' }]}>
          {isCredit ? '-' : '+'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.typeLabel}>{isCredit ? 'credit' : 'payment'}</Text>
      </View>
      {onDelete ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(transaction.id)}>
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#aaa',
  },
  right: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  typeLabel: {
    fontSize: 10,
    color: '#ccc',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#ccc',
    lineHeight: 22,
  },
});

export default TransactionItem;
