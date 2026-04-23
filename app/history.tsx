import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function HistoryScreen() {
  const context = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  if (!context) return null;
  const { habits, habitLogs, categories, theme } = context;

  const filteredLogs = useMemo(() => {
    return habitLogs
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((log) => {
        const habit = habits.find((h) => h.id === log.habitId);
        if (!habit) return false;
        if (
          searchText.trim() &&
          !habit.name.toLowerCase().includes(searchText.trim().toLowerCase())
        ) {
          return false;
        }
        if (categoryFilter !== null && habit.categoryId !== categoryFilter) {
          return false;
        }
        if (fromDate.trim() && log.date < fromDate.trim()) return false;
        if (toDate.trim() && log.date > toDate.trim()) return false;
        return true;
      });
  }, [habitLogs, habits, searchText, fromDate, toDate, categoryFilter]);

  const clearFilters = () => {
    setSearchText('');
    setFromDate('');
    setToDate('');
    setCategoryFilter(null);
  };

  const hasFilters =
    searchText !== '' || fromDate !== '' || toDate !== '' || categoryFilter !== null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
            <Text style={[styles.backLabel, { color: theme.text }]}>Back</Text>
          </Pressable>
        </View>

        <ScreenHeader
          title="History"
          subtitle={`${filteredLogs.length} ${filteredLogs.length === 1 ? 'log' : 'logs'} found`}
        />

        <View style={[styles.filterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.filterTitle, { color: theme.text }]}>Filters</Text>

          <FormField
            label="Search by habit name"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="e.g. water"
          />

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <FormField
                label="From"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <FormField
                label="To"
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <Text style={[styles.subLabel, { color: theme.textMuted }]}>Category</Text>
          <View style={styles.pillRow}>
            <Pressable
              accessibilityLabel="All categories"
              accessibilityRole="button"
              onPress={() => setCategoryFilter(null)}
              style={[
                styles.pill,
                {
                  backgroundColor:
                    categoryFilter === null ? theme.primary : theme.surface,
                  borderColor:
                    categoryFilter === null ? theme.primary : theme.inputBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  {
                    color:
                      categoryFilter === null
                        ? theme.textOnPrimary
                        : theme.text,
                  },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.map((cat) => {
              const isActive = categoryFilter === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityLabel={`Category ${cat.name}`}
                  accessibilityRole="button"
                  onPress={() => setCategoryFilter(cat.id)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive ? cat.color : theme.surface,
                      borderColor: cat.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillLabel,
                      { color: isActive ? '#FFFFFF' : cat.color },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {hasFilters ? (
            <View style={styles.clearWrap}>
              <PrimaryButton
                label="Clear filters"
                onPress={clearFilters}
                variant="secondary"
                compact
              />
            </View>
          ) : null}
        </View>

        {filteredLogs.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No logs match those filters</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Try clearing some filters or logging from the Today tab.
            </Text>
          </View>
        ) : (
          filteredLogs.map((log) => {
            const habit = habits.find((h) => h.id === log.habitId);
            const cat = habit
              ? categories.find((c) => c.id === habit.categoryId)
              : undefined;
            const valueLabel =
              habit?.metricType === 'boolean'
                ? 'Done'
                : `${log.value}${habit?.unit ? ' ' + habit.unit : ''}`;
            return (
              <View key={log.id} style={[styles.logCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View
                  style={[
                    styles.logIconCircle,
                    { backgroundColor: cat?.color ?? theme.primary },
                  ]}
                >
                  <Ionicons
                    name={(cat?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.logMain}>
                  <Text style={[styles.logHabit, { color: theme.text }]}>
                    {habit?.name ?? 'Unknown habit'}
                  </Text>
                  <Text style={[styles.logMeta, { color: theme.textMuted }]}>
                    {log.date} • {valueLabel}
                  </Text>
                </View>
              </View>
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
  },
  content: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  topRow: {
    marginBottom: 6,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearWrap: {
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
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
  logCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  logIconCircle: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  logMain: {
    flex: 1,
  },
  logHabit: {
    fontSize: 14,
    fontWeight: '700',
  },
  logMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
