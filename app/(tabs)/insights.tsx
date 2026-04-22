import ScreenHeader from '@/components/ui/screen-header';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function InsightsScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { habitLogs } = context;

  // Get the last 7 dates as YYYY-MM-DD
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  // Count how many logs happened each of those days
  const logsPerDay = last7Days.map(
    (date) => habitLogs.filter((l) => l.date === date).length
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Insights" subtitle="Last 7 days" />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Logs per day</Text>
          <View style={styles.barRow}>
            {logsPerDay
              .slice()
              .reverse()
              .map((count, i) => (
                <View key={i} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(4, count * 8) },
                    ]}
                  />
                  <Text style={styles.barLabel}>{count}</Text>
                </View>
              ))}
          </View>
        </View>

        <Text style={styles.placeholder}>
          The proper daily, weekly and monthly chart with a real chart library
          gets built in Phase 3.
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
    marginBottom: 10,
  },
  barRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 100,
    justifyContent: 'space-between',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    backgroundColor: '#0F766E',
    borderRadius: 4,
    width: '100%',
  },
  barLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
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
