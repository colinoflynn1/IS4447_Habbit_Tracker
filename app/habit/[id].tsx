import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import MetricTypePicker from '@/components/ui/metric-type-picker';
import PrimaryButton from '@/components/ui/primary-button';
import ProgressBar from '@/components/ui/progress-bar';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import {
  habitLogs as habitLogsTable,
  habits as habitsTable,
  targets as targetsTable,
} from '@/db/schema';
import { currentMonthDates, currentWeekDates, sumHabitLogs } from '@/lib/date-utils';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);

  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [metricType, setMetricType] = useState<'boolean' | 'count'>('boolean');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);

  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newTargetPeriod, setNewTargetPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (!context) return;
    const habit = context.habits.find((h) => h.id === habitId);
    if (habit) {
      setName(habit.name);
      setCategoryId(habit.categoryId);
      setMetricType(habit.metricType === 'count' ? 'count' : 'boolean');
      setUnit(habit.unit ?? '');
    }
  }, [context, habitId]);

  if (!context) return null;
  const { categories, habits, habitLogs, targets, currentUserId, refreshAll, theme } = context;
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <Text style={[styles.notFound, { color: theme.textMuted }]}>Habit not found.</Text>
          <PrimaryButton label="Back" onPress={() => router.back()} compact />
        </View>
      </SafeAreaView>
    );
  }

  const habitTargets = targets.filter((t) => t.habitId === habitId);
  const weekDates = currentWeekDates();
  const monthDates = currentMonthDates();
  const weekProgress = sumHabitLogs(habitLogs, habitId, weekDates);
  const monthProgress = sumHabitLogs(habitLogs, habitId, monthDates);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for this habit.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Pick a category', 'Every habit needs a category.');
      return;
    }

    setSaving(true);
    try {
      await db
        .update(habitsTable)
        .set({
          name: name.trim(),
          categoryId,
          metricType,
          unit: metricType === 'count' && unit.trim() ? unit.trim() : null,
        })
        .where(eq(habitsTable.id, habitId));
      await refreshAll();
      router.back();
    } catch (error) {
      Alert.alert('Could not save', 'Something went wrong saving this habit.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTarget = async () => {
    const amount = parseInt(newTargetAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Enter a number', 'Target amount must be a positive number.');
      return;
    }
    if (!currentUserId) return;

    try {
      await db.insert(targetsTable).values({
        userId: currentUserId,
        habitId,
        categoryId: null,
        period: newTargetPeriod,
        amount,
      });
      setNewTargetAmount('');
      await refreshAll();
    } catch (error) {
      Alert.alert('Could not save', 'Something went wrong saving this target.');
      console.error(error);
    }
  };

  const handleDeleteTarget = (targetId: number) => {
    Alert.alert('Delete target?', 'This target will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.delete(targetsTable).where(eq(targetsTable.id, targetId));
            await refreshAll();
          } catch (error) {
            Alert.alert('Could not delete', 'Something went wrong.');
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete habit?',
      `"${habit.name}" and all of its logs and targets will be deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, habitId));
              await db.delete(targetsTable).where(eq(targetsTable.habitId, habitId));
              await db.delete(habitsTable).where(eq(habitsTable.id, habitId));
              await refreshAll();
              router.back();
            } catch (error) {
              Alert.alert('Could not delete', 'Something went wrong.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

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

        <ScreenHeader title="Edit habit" subtitle={habit.name} />

        <FormField label="Name" value={name} onChangeText={setName} />

        <CategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />

        <MetricTypePicker value={metricType} onChange={setMetricType} />

        {metricType === 'count' ? (
          <FormField
            label="Unit (optional)"
            value={unit}
            onChangeText={setUnit}
            placeholder="e.g. glasses, minutes, km"
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={saving ? 'Saving...' : 'Save changes'}
            onPress={handleSave}
          />
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Targets</Text>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
          Set weekly or monthly goals for this habit. Progress is calculated from your logs.
        </Text>

        {habitTargets.length === 0 ? (
          <Text style={[styles.emptyNote, { color: theme.textMuted }]}>
            No targets for this habit yet. Add one below.
          </Text>
        ) : (
          habitTargets.map((target) => {
            const progress = target.period === 'weekly' ? weekProgress : monthProgress;
            return (
              <View key={target.id} style={[styles.targetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <ProgressBar
                  label={`${target.period === 'weekly' ? 'This week' : 'This month'} target`}
                  current={progress}
                  target={target.amount}
                  unit={habit.unit}
                />
                <Pressable
                  accessibilityLabel="Delete target"
                  accessibilityRole="button"
                  onPress={() => handleDeleteTarget(target.id)}
                  style={styles.removeTargetBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                  <Text style={[styles.removeTargetLabel, { color: theme.danger }]}>Remove</Text>
                </Pressable>
              </View>
            );
          })
        )}

        <View style={[styles.addTargetBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.addTargetTitle, { color: theme.text }]}>Add a new target</Text>
          <View style={styles.periodRow}>
            {(['weekly', 'monthly'] as const).map((period) => (
              <Pressable
                key={period}
                accessibilityLabel={`Target period ${period}`}
                accessibilityRole="button"
                onPress={() => setNewTargetPeriod(period)}
                style={[
                  styles.periodPill,
                  {
                    backgroundColor: newTargetPeriod === period ? theme.primary : theme.surface,
                    borderColor: newTargetPeriod === period ? theme.primary : theme.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodPillLabel,
                    { color: newTargetPeriod === period ? theme.textOnPrimary : theme.text },
                  ]}
                >
                  {period === 'weekly' ? 'Weekly' : 'Monthly'}
                </Text>
              </Pressable>
            ))}
          </View>
          <FormField
            label={`Target amount${habit.unit ? ' (' + habit.unit + ')' : ''}`}
            value={newTargetAmount}
            onChangeText={setNewTargetAmount}
            placeholder="e.g. 5"
            keyboardType="numeric"
          />
          <PrimaryButton
            label="Add target"
            onPress={handleAddTarget}
            variant="secondary"
            compact
          />
        </View>

        <View style={styles.dangerZone}>
          <PrimaryButton label="Delete habit" onPress={handleDelete} variant="danger" />
        </View>
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
  actions: {
    marginTop: 12,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: 4,
  },
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  targetCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  removeTargetBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginTop: 8,
  },
  removeTargetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addTargetBox: {
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    marginTop: 6,
    padding: 12,
  },
  addTargetTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  periodPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  periodPillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 30,
  },
  notFound: {
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});
