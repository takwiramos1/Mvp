import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats, getRecentTransactions } from '../database/db';
import { useAppContext } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

const HomeScreen = ({ navigation }) => {
  const { refreshKey, businessName } = useAppContext();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([getDashboardStats(), getRecentTransactions(8)]);
      setStats(s);
      setRecent(r);
    } catch (err) {
      console.error('HomeScreen load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, refreshKey])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C853']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.shopName}>{businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Hero Total Owed */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Outstanding</Text>
        <Text style={styles.heroAmount}>{formatCurrency(stats?.totalOwed ?? 0)}</Text>
        <Text style={styles.heroSub}>
          {stats?.activeDebtors ?? 0} customer{stats?.activeDebtors !== 1 ? 's' : ''} owe you
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <SummaryCard
          title="Today's Credit"
          value={formatCurrency(stats?.todayCredit ?? 0)}
          subtitle="given today"
          color="#E53935"
          icon="📤"
        />
        <SummaryCard
          title="Today's Payments"
          value={formatCurrency(stats?.todayPayments ?? 0)}
          subtitle="received today"
          color="#00C853"
          icon="📥"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#E53935' }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'credit' })}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Give Credit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#00C853' }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'payment' })}
        >
          <Ionicons name="cash-outline" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Record Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="No activity yet"
            subtitle="Start by adding a customer and recording a credit transaction"
          />
        ) : (
          <View style={styles.recentCard}>
            {recent.map((tx) => (
              <View key={tx.id}>
                <View style={styles.txCustomerRow}>
                  <Text style={styles.txCustomerName}>{tx.customer_name}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                </View>
                <TransactionItem transaction={tx} />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  settingsBtn: {
    padding: 8,
  },
  heroCard: {
    backgroundColor: '#00C853',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 13,
    color: '#00C853',
    fontWeight: '600',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  txCustomerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  txCustomerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txDate: {
    fontSize: 11,
    color: '#aaa',
  },
});

export default HomeScreen;
