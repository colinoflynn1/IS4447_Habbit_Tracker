import HabitLogRow from '@/components/ui/habit-log-row';
import ScreenHeader from '@/components/ui/screen-header';
import { todayString } from '@/lib/date-utils';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function TodayScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { habits, habitLogs, categories, currentUserId, refreshAll } = context;
  const today = todayString();

  // Map of today's logs keyed by habit id so each row can look up its own log.
  const todaysLogByHabit = new Map(
    habitLogs.filter((l) => l.date === today).map((l) => [l.habitId, l])
  );

  // How many habits have been logged today (boolean done or count greater than 0).
  const loggedCount = habits.filter((h) => {
    const log = todaysLogByHabit.get(h.id);
    return log && log.value > 0;
  }).length;

  const completionPct =
    habits.length > 0 ? Math.round((loggedCount / habits.length) * 100) : 0;

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Today" subtitle={dateLabel} />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Daily progress</Text>
              <Text style={styles.summarySub}>
                {loggedCount} of {habits.length} habits logged
              </Text>
            </View>
            <Text style={styles.summaryPct}>{completionPct}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${completionPct}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Log your habits</Text>

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              Head to the Habits tab and add one to start tracking.
            </Text>
          </View>
        ) : (
          currentUserId &&
          habits.map((habit) => {
            const category = categories.find((c) => c.id === habit.categoryId);
            return (
              <HabitLogRow
                key={habit.id}
                habit={habit}
                category={category}
                todaysLog={todaysLogByHabit.get(habit.id)}
                userId={currentUserId}
                today={today}
                onChange={refreshAll}
              />
            );
          })
        )}
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  summarySub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  summaryPct: {
    color: '#0F766E',
    fontSize: 24,
    fontWeight: '700',
  },
  track: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: '#0F766E',
    borderRadius: 6,
    height: '100%',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 30,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
