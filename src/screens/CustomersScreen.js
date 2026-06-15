import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllCustomers } from '../database/db';
import { useAppContext } from '../context/AppContext';
import CustomerCard from '../components/CustomerCard';
import EmptyState from '../components/EmptyState';

const CustomersScreen = ({ navigation }) => {
  const { refreshKey } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('CustomersScreen error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers, refreshKey])
  );

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const debtors = filtered.filter((c) => parseFloat(c.balance) > 0);
  const settled = filtered.filter((c) => parseFloat(c.balance) <= 0);

  const totalOwed = customers.reduce((sum, c) => {
    const b = parseFloat(c.balance) || 0;
    return sum + (b > 0 ? b : 0);
  }, 0);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Summary Strip */}
      {customers.length > 0 ? (
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            {customers.filter((c) => parseFloat(c.balance) > 0).length} debtors ·{' '}
            <Text style={styles.summaryAmount}>${totalOwed.toFixed(2)}</Text> total owed
          </Text>
        </View>
      ) : null}

      <FlatList
        data={[...debtors, ...settled]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id, customerName: item.name })}
          />
        )}
        ListHeaderComponent={
          debtors.length > 0 && !search ? (
            <Text style={styles.listHeader}>Owes You ({debtors.length})</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title={search ? 'No results' : 'No customers yet'}
            subtitle={
              search
                ? `No customers match "${search}"`
                : 'Tap the + button to add your first customer'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadCustomers(); }}
            colors={['#00C853']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCustomer')}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  summaryStrip: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#999',
  },
  summaryAmount: {
    color: '#E53935',
    fontWeight: '700',
  },
  listHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CustomersScreen;
