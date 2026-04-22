import ScreenHeader from '@/components/ui/screen-header';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function SettingsScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { habits, habitLogs, categories, targets } = context;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Settings" subtitle="Preferences and account" />

        <Pressable
          accessibilityLabel="Manage categories"
          accessibilityRole="button"
          onPress={() => router.push('/categories')}
          style={({ pressed }) => [styles.linkRow, pressed ? styles.linkRowPressed : null]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="pricetags-outline" size={20} color="#0F766E" />
            <Text style={styles.linkLabel}>Manage categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Database status</Text>
          <Text style={styles.row}>Categories: {categories.length}</Text>
          <Text style={styles.row}>Habits: {habits.length}</Text>
          <Text style={styles.row}>Logs: {habitLogs.length}</Text>
          <Text style={styles.row}>Targets: {targets.length}</Text>
        </View>

        <Text style={styles.placeholder}>
          Account controls, dark mode, notifications and CSV export are coming
          in later phases.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 24,
  },
  linkRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
  },
  linkRowPressed: {
    opacity: 0.7,
  },
  linkLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  linkLabel: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    color: '#334155',
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    padding: 14,
  },
});
