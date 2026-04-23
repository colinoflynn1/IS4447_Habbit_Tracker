import FormField from '@/components/ui/form-field';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { calculateStreak } from '@/lib/streaks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Habit } from '../_layout';

export default function HabitsScreen() {
  const context = useContext(AppContext);
  const [search, setSearch] = useState('');

  if (!context) return null;

  const { habits, categories, habitLogs, theme } = context;
  const categoryForHabit = (habit: Habit) =>
    categories.find((c) => c.id === habit.categoryId);

  const filtered = search.trim()
    ? habits.filter((h) =>
        h.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : habits;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />
          <PrimaryButton
            label="+ Add"
            onPress={() => router.push('/habit/new')}
            compact
          />
        </View>

        {habits.length > 0 ? (
          <FormField
            label="Search"
            value={search}
            onChangeText={setSearch}
            placeholder="Type to filter habits"
          />
        ) : null}

        {habits.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="list-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No habits yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Tap Add to create your first habit.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No matches</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No habits found for &quot;{search}&quot;.
            </Text>
          </View>
        ) : (
          filtered.map((habit) => {
            const category = categoryForHabit(habit);
            const streak = calculateStreak(habitLogs, habit.id);
            return (
              <Pressable
                key={habit.id}
                accessibilityLabel={`Edit ${habit.name}`}
                accessibilityRole="button"
                onPress={() => router.push(`/habit/${habit.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardMain}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: theme.text }]}>{habit.name}</Text>
                      {streak > 0 ? (
                        <View style={styles.streakBadge}>
                          <Ionicons name="flame" size={11} color="#EA580C" />
                          <Text style={styles.streakBadgeText}>{streak}d</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.tags}>
                      {category ? (
                        <InfoTag
                          label="Category"
                          value={category.name}
                          color={category.color}
                        />
                      ) : null}
                      <InfoTag
                        label="Type"
                        value={habit.metricType === 'boolean' ? 'Done or not' : 'Count'}
                      />
                      {habit.unit ? <InfoTag label="Unit" value={habit.unit} /> : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </View>
              </Pressable>
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMain: {
    flex: 1,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 999,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakBadgeText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
