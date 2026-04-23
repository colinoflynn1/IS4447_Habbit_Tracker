import FormField from '@/components/ui/form-field';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
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

  const { habits, categories } = context;
  const categoryForHabit = (habit: Habit) =>
    categories.find((c) => c.id === habit.categoryId);

  // Filter habits by the search text. Case insensitive match against the name.
  const filtered = search.trim()
    ? habits.filter((h) =>
        h.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : habits;

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              Tap Add to create your first habit.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyText}>
              No habits found for &quot;{search}&quot;.
            </Text>
          </View>
        ) : (
          filtered.map((habit) => {
            const category = categoryForHabit(habit);
            return (
              <Pressable
                key={habit.id}
                accessibilityLabel={`Edit ${habit.name}`}
                accessibilityRole="button"
                onPress={() => router.push(`/habit/${habit.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardMain}>
                    <Text style={styles.name}>{habit.name}</Text>
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
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
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
  name: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
