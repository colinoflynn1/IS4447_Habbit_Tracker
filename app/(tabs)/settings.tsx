import ScreenHeader from '@/components/ui/screen-header';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Database status</Text>
          <Text style={styles.row}>Categories: {categories.length}</Text>
          <Text style={styles.row}>Habits: {habits.length}</Text>
          <Text style={styles.row}>Logs: {habitLogs.length}</Text>
          <Text style={styles.row}>Targets: {targets.length}</Text>
        </View>

        <Text style={styles.placeholder}>
          Account controls (register, login, logout, delete profile), dark mode,
          notifications and CSV export land in later phases.
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
