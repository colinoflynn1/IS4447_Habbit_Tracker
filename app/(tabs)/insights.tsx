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
  const { habitLogs, habits, categories } = context;

  // Pick which dates to show based on the selected mode.
  // Day view = last 7 days, Week = current Mon to Sun, Month = current month
  let dates: string[];
  let labelMode: 'day' | 'date';
  if (mode === 'day') {
    dates = lastNDays(7);
    labelMode = 'day';
  } else if (mode === 'week') {
    dates = currentWeekDates();
    labelMode = 'day';
  } else {
    // For month I only show every few days otherwise the chart is unreadable
    const all = currentMonthDates();
    const step = Math.max(1, Math.floor(all.length / 10));
    dates = all.filter((_, i) => i % step === 0);
    labelMode = 'date';
  }

  const chartData = dates.map((date) => ({
    label: shortDateLabel(date, labelMode),
    value: countLogsByDate(habitLogs, date),
  }));

  // Total logs in the selected period
  const totalLogs = chartData.reduce((sum, d) => sum + d.value, 0);

  // Average per day
  const average = dates.length > 0 ? Math.round(totalLogs / dates.length) : 0;

  // Best day in the period
  const bestDay = chartData.reduce(
    (best, d) => (d.value > best.value ? d : best),
    { label: '-', value: 0 }
  );

  // Per category totals so I can show a simple breakdown.
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Insights"
          subtitle="See how your habits are tracking"
        />

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          {(['day', 'week', 'month'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityLabel={`View ${option}`}
              accessibilityRole="button"
              onPress={() => setMode(option)}
              style={[
                styles.toggleButton,
                mode === option ? styles.toggleButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  mode === option ? styles.toggleLabelActive : null,
                ]}
              >
                {option === 'day' ? 'Last 7 days' : option === 'week' ? 'This week' : 'This month'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalLogs}</Text>
            <Text style={styles.statLabel}>Total logs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{average}</Text>
            <Text style={styles.statLabel}>Avg per day</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bestDay.value}</Text>
            <Text style={styles.statLabel}>Best ({bestDay.label})</Text>
          </View>
        </View>

        {/* Bar chart card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Habits logged per day</Text>
          {totalLogs === 0 ? (
            <Text style={styles.emptyChartText}>
              No logs yet for this period. Start logging from the Today tab.
            </Text>
          ) : (
            <BarChart data={chartData} height={170} color="#0F766E" />
          )}
        </View>

        {/* Category breakdown card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By category</Text>
          {categoryStats.every((c) => c.total === 0) ? (
            <Text style={styles.emptyChartText}>
              No category data yet for this period.
            </Text>
          ) : (
            categoryStats.map((cat) => (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: cat.color }]}
                  />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.total}</Text>
                </View>
                <View style={styles.categoryTrack}>
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
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 24,
  },
  toggleRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
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
  toggleButtonActive: {
    backgroundColor: '#0F766E',
  },
  toggleLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  statValue: {
    color: '#0F766E',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
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
  emptyChartText: {
    color: '#64748B',
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
    color: '#0F172A',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryCount: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTrack: {
    backgroundColor: '#E5E7EB',
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
