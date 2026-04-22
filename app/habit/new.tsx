import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import MetricTypePicker from '@/components/ui/metric-type-picker';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function NewHabitScreen() {
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [metricType, setMetricType] = useState<'boolean' | 'count'>('boolean');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);

  if (!context) return null;
  const { categories, currentUserId, refreshAll } = context;

  const handleSave = async () => {
    // Basic validation. If any required field is missing I show an alert.
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for this habit.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Pick a category', 'Every habit needs a category.');
      return;
    }
    if (!currentUserId) {
      Alert.alert('No user', 'No user is logged in.');
      return;
    }

    setSaving(true);
    try {
      await db.insert(habitsTable).values({
        userId: currentUserId,
        categoryId,
        name: name.trim(),
        metricType,
        unit: metricType === 'count' && unit.trim() ? unit.trim() : null,
        createdAt: new Date().toISOString(),
      });
      await refreshAll();
      router.back();
    } catch (error) {
      Alert.alert('Could not save', 'Something went wrong saving this habit.');
      console.error(error);
    } finally {
      setSaving(false);
    }
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

        <ScreenHeader title="New habit" subtitle="Something you want to track" />

        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Run in the morning"
        />

        {categories.length === 0 ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              You need at least one category before you can add a habit.
              Head over to Settings, Manage categories to create one.
            </Text>
          </View>
        ) : (
          <CategoryPicker
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        )}

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
            label={saving ? 'Saving...' : 'Save habit'}
            onPress={handleSave}
          />
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
  warning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  warningText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    marginTop: 12,
  },
});
