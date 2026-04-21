import InfoTag from '@/components/ui/info-tag';
import ScreenHeader from '@/components/ui/screen-header';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Habit } from '../_layout';

export default function HabitsScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { habits, categories } = context;
  const categoryForHabit = (habit: Habit) =>
    categories.find((c) => c.id === habit.categoryId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />

        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet</Text>
        ) : (
          habits.map((habit) => {
            const category = categoryForHabit(habit);
            return (
              <View key={habit.id} style={styles.card}>
                <Text style={styles.name}>{habit.name}</Text>
                <View style={styles.tags}>
                  {category ? (
                    <InfoTag
                      label="Category"
                      value={category.name}
                      color={category.color}
                    />
                  ) : null}
                  <InfoTag label="Type" value={habit.metricType} />
                  {habit.unit ? <InfoTag label="Unit" value={habit.unit} /> : null}
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
    marginBottom: 10,
    padding: 14,
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
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    paddingTop: 20,
  },
});
