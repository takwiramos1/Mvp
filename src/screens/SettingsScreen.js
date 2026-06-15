import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const SHARE_TEXT =
  `I've been tracking my credit with TuckBook - it's free and super easy! ` +
  `Get it here: https://tuckbook.app\n\n` +
  `Never forget who owes you money again 💰`;

const SettingsScreen = ({ navigation }) => {
  const { businessName, setBusinessName } = useAppContext();
  const [name, setName] = useState(businessName);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Enter a name', 'Business name cannot be empty.');
      return;
    }
    setBusinessName(name.trim());
    Alert.alert('Saved', 'Business name updated!');
  };

  const handleShare = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(SHARE_TEXT)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp not found', 'Please share the app link manually.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Business Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Business</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Business / Shop Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tendai's Tuck Shop"
            placeholderTextColor="#bbb"
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Name</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Share */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spread the Word</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Know another shop owner who forgets who owes them? Share TuckBook for free.
          </Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upgrade Banner */}
      <View style={styles.upgradeCard}>
        <Text style={styles.upgradeEmoji}>⭐</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.upgradeTitle}>TuckBook Pro — $1/month</Text>
          <Text style={styles.upgradeDesc}>Unlimited customers · SMS bulk reminders · Export to PDF</Text>
        </View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <Text style={styles.versionText}>TuckBook v1.0.0 · Made for informal businesses</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 8,
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
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#00C853',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  shareBtn: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  upgradeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  upgradeEmoji: { fontSize: 28 },
  upgradeTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  upgradeDesc: { color: '#aaa', fontSize: 11, lineHeight: 16 },
  upgradeBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upgradeBtnText: { color: '#1a1a1a', fontWeight: '800', fontSize: 12 },
  versionText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 11,
  },
});

export default SettingsScreen;
