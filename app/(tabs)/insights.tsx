import BarChart from '@/components/ui/bar-chart';
import ScreenHeader from '@/components/ui/screen-header';
import {
  countLogsByDate,
  currentMonthDates,
  currentWeekDates,
  lastNDays,
  shortDateLabel,
} from '@/lib/date-utils';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

type ViewMode = 'day' | 'week' | 'month';

export default function InsightsScreen() {
  const context = useContext(AppContext);
  const [mode, setMode] = useState<ViewMode>('week');

  if (!context) return null;
  const { habitLogs, habits, categories, theme } = context;

  let dates: string[];
  let labelMode: 'day' | 'date';
  if (mode === 'day') {
    dates = lastNDays(7);
    labelMode = 'day';
  } else if (mode === 'week') {
    dates = currentWeekDates();
    labelMode = 'day';
  } else {
    const all = currentMonthDates();
    const step = Math.max(1, Math.floor(all.length / 10));
    dates = all.filter((_, i) => i % step === 0);
    labelMode = 'date';
  }

  const chartData = dates.map((date) => ({
    label: shortDateLabel(date, labelMode),
    value: countLogsByDate(habitLogs, date),
  }));

  const totalLogs = chartData.reduce((sum, d) => sum + d.value, 0);
  const average = dates.length > 0 ? Math.round(totalLogs / dates.length) : 0;
  const bestDay = chartData.reduce(
    (best, d) => (d.value > best.value ? d : best),
    { label: '-', value: 0 }
  );

  const dateSet = new Set(dates);
  const categoryStats = categories.map((category) => {
    const habitsInCategory = habits.filter((h) => h.categoryId === category.id);
    const habitIds = new Set(habitsInCategory.map((h) => h.id));
    const totalForCategory = habitLogs
      .filter((l) => habitIds.has(l.habitId) && dateSet.has(l.date) && l.value > 0)
      .length;
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      total: totalForCategory,
    };
  });

  const maxCategoryTotal = Math.max(...categoryStats.map((c) => c.total), 1);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Insights" subtitle="See how your habits are tracking" />

        <View style={[styles.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(['day', 'week', 'month'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityLabel={`View ${option}`}
              accessibilityRole="button"
              onPress={() => setMode(option)}
              style={[
                styles.toggleButton,
                mode === option ? { backgroundColor: theme.primary } : null,
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  { color: mode === option ? theme.textOnPrimary : theme.textMuted },
                ]}
              >
                {option === 'day' ? 'Last 7 days' : option === 'week' ? 'This week' : 'This month'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          {[
            { value: totalLogs, label: 'Total logs' },
            { value: average, label: 'Avg per day' },
            { value: bestDay.value, label: `Best (${bestDay.label})` },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Habits logged per day</Text>
          {totalLogs === 0 ? (
            <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>
              No logs yet for this period. Start logging from the Today tab.
            </Text>
          ) : (
            <BarChart data={chartData} height={170} color={theme.primary} />
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>By category</Text>
          {categoryStats.every((c) => c.total === 0) ? (
            <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>
              No category data yet for this period.
            </Text>
          ) : (
            categoryStats.map((cat) => (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                  <Text style={[styles.categoryCount, { color: theme.textMuted }]}>{cat.total}</Text>
                </View>
                <View style={[styles.categoryTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.categoryFill,
                      {
                        backgroundColor: cat.color,
                        width: `${(cat.total / maxCategoryTotal) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
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
  toggleRow: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 4,
  },
  toggleButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyChartText: {
    fontSize: 13,
    paddingVertical: 20,
    textAlign: 'center',
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTrack: {
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  categoryFill: {
    borderRadius: 4,
    height: '100%',
  },
});
