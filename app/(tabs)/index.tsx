import HabitLogRow from '@/components/ui/habit-log-row';
import ScreenHeader from '@/components/ui/screen-header';
import { todayString } from '@/lib/date-utils';
import { calculateStreak } from '@/lib/streaks';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function TodayScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { habits, habitLogs, categories, currentUserId, refreshAll, theme } = context;
  const today = todayString();

  const todaysLogByHabit = new Map(
    habitLogs.filter((l) => l.date === today).map((l) => [l.habitId, l])
  );

  const loggedCount = habits.filter((h) => {
    const log = todaysLogByHabit.get(h.id);
    return log && log.value > 0;
  }).length;

  const completionPct =
    habits.length > 0 ? Math.round((loggedCount / habits.length) * 100) : 0;

  // Find the longest current streak across all habits.
  const allStreaks = habits.map((h) => ({
    habit: h,
    streak: calculateStreak(habitLogs, h.id),
  }));
  const longestStreak = allStreaks.reduce(
    (best, s) => (s.streak > best.streak ? s : best),
    { habit: null as any, streak: 0 }
  );

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Today" subtitle={dateLabel} />

        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Daily progress</Text>
              <Text style={[styles.summarySub, { color: theme.textMuted }]}>
                {loggedCount} of {habits.length} habits logged
              </Text>
            </View>
            <Text style={[styles.summaryPct, { color: theme.primary }]}>{completionPct}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View style={[styles.fill, { width: `${completionPct}%`, backgroundColor: theme.primary }]} />
          </View>
        </View>

        {longestStreak.streak > 0 ? (
          <View style={[styles.streakCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.streakIconCircle}>
              <Ionicons name="flame" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.streakText}>
              <Text style={[styles.streakNum, { color: theme.text }]}>
                {longestStreak.streak}-day streak
              </Text>
              <Text style={[styles.streakSub, { color: theme.textMuted }]}>
                Keep going with {longestStreak.habit?.name}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Log your habits</Text>

        {habits.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="add-circle-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No habits yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
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
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 24,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryPct: {
    fontSize: 24,
    fontWeight: '700',
  },
  track: {
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 6,
    height: '100%',
  },
  streakCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 12,
  },
  streakIconCircle: {
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  streakText: {
    flex: 1,
  },
  streakNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  streakSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
