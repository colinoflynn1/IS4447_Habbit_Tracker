import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import MetricTypePicker from '@/components/ui/metric-type-picker';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
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

  // Load the current values once I know which habit this is.
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
  const { categories, habits, refreshAll } = context;
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.notFound}>Habit not found.</Text>
          <PrimaryButton label="Back" onPress={() => router.back()} compact />
        </View>
      </SafeAreaView>
    );
  }

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

  const handleDelete = () => {
    Alert.alert(
      'Delete habit?',
      `"${habit.name}" and all of its logs will be deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the logs first so no orphans are left behind.
              await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, habitId));
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
            <Text style={styles.backLabel}>Back</Text>
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

        <View style={styles.dangerZone}>
          <PrimaryButton label="Delete habit" onPress={handleDelete} variant="danger" />
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
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    marginTop: 12,
  },
  dangerZone: {
    marginTop: 20,
  },
  notFound: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});
