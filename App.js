import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDB } from './src/database/db';
import { AppProvider } from './src/context/AppContext';

import HomeScreen from './src/screens/HomeScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import AddCustomerScreen from './src/screens/AddCustomerScreen';
import EditCustomerScreen from './src/screens/EditCustomerScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BRAND = '#00C853';
const BRAND_DARK = '#007B33';

const tabBarStyle = {
  backgroundColor: '#fff',
  borderTopColor: '#f0f0f0',
  borderTopWidth: 1,
  height: 60,
  paddingBottom: 8,
  paddingTop: 6,
};

const headerStyle = {
  backgroundColor: '#fff',
};

const headerTitleStyle = {
  fontWeight: '700',
  fontSize: 17,
  color: '#1a1a1a',
};

// Bottom Tabs
const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle,
      headerTitleStyle,
      headerShadowVisible: false,
      tabBarStyle,
      tabBarActiveTintColor: BRAND,
      tabBarInactiveTintColor: '#bbb',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Customers: focused ? 'people' : 'people-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'TuckBook', tabBarLabel: 'Dashboard' }}
    />
    <Tab.Screen
      name="Customers"
      component={CustomersScreen}
      options={{ title: 'Customers' }}
    />
  </Tab.Navigator>
);

// Root Stack (wraps tabs + modals)
const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle,
      headerTitleStyle,
      headerShadowVisible: false,
      headerTintColor: BRAND,
    }}
  >
    <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
    <Stack.Screen
      name="CustomerDetail"
      component={CustomerDetailScreen}
      options={({ route }) => ({ title: route.params?.customerName ?? 'Customer' })}
    />
    <Stack.Screen
      name="AddCustomer"
      component={AddCustomerScreen}
      options={{ title: 'New Customer', presentation: 'modal' }}
    />
    <Stack.Screen
      name="EditCustomer"
      component={EditCustomerScreen}
      options={{ title: 'Edit Customer', presentation: 'modal' }}
    />
    <Stack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
      options={({ route }) => ({
        title: route.params?.type === 'payment' ? 'Record Payment' : 'Give Credit',
        presentation: 'modal',
      })}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings', presentation: 'modal' }}
    />
  </Stack.Navigator>
);

// Loading Screen
const LoadingScreen = () => (
  <View style={styles.splash}>
    <Text style={styles.splashLogo}>💰</Text>
    <Text style={styles.splashTitle}>TuckBook</Text>
    <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
  </View>
);

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('DB init failed:', err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to start: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#fff" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 60,
    marginBottom: 12,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    textAlign: 'center',
  },
});
