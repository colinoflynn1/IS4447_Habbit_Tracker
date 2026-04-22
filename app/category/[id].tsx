import ColorPicker from '@/components/ui/color-picker';
import FormField from '@/components/ui/form-field';
import IconPicker from '@/components/ui/icon-picker';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);

  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0F766E');
  const [icon, setIcon] = useState('barbell-outline');
  const [saving, setSaving] = useState(false);

  // Load the current category values once the context is ready.
  useEffect(() => {
    if (!context) return;
    const category = context.categories.find((c) => c.id === categoryId);
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon);
    }
  }, [context, categoryId]);

  if (!context) return null;
  const { categories, habits, refreshAll } = context;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.notFound}>Category not found.</Text>
          <PrimaryButton label="Back" onPress={() => router.back()} compact />
        </View>
      </SafeAreaView>
    );
  }

  // Count how many habits are in this category. Delete is blocked if any exist.
  const habitsInCategory = habits.filter((h) => h.categoryId === categoryId);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please give the category a name.');
      return;
    }

    setSaving(true);
    try {
      await db
        .update(categoriesTable)
        .set({
          name: name.trim(),
          color,
          icon,
        })
        .where(eq(categoriesTable.id, categoryId));
      await refreshAll();
      router.back();
    } catch (error) {
      Alert.alert('Could not save', 'Something went wrong saving this category.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    // Rule: do not allow deleting a category that still has habits attached.
    // This prevents habits from being orphaned. The user has to move or delete
    // the habits first.
    if (habitsInCategory.length > 0) {
      Alert.alert(
        'Cannot delete',
        `This category has ${habitsInCategory.length} ${
          habitsInCategory.length === 1 ? 'habit' : 'habits'
        } in it. Move or delete them first.`
      );
      return;
    }

    Alert.alert(
      'Delete category?',
      `"${category.name}" will be deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
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

        <ScreenHeader title="Edit category" subtitle={category.name} />

        <FormField label="Name" value={name} onChangeText={setName} />

        <ColorPicker value={color} onChange={setColor} />

        <IconPicker value={icon} onChange={setIcon} color={color} />

        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: color }]}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.previewLabel}>{name || 'Preview'}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={saving ? 'Saving...' : 'Save changes'}
            onPress={handleSave}
          />
        </View>

        <View style={styles.dangerZone}>
          <PrimaryButton label="Delete category" onPress={handleDelete} variant="danger" />
          {habitsInCategory.length > 0 ? (
            <Text style={styles.dangerHelper}>
              You cannot delete this while it has {habitsInCategory.length}{' '}
              {habitsInCategory.length === 1 ? 'habit' : 'habits'} in it.
            </Text>
          ) : null}
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
  preview: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    padding: 12,
  },
  previewIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  previewLabel: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    marginTop: 12,
  },
  dangerZone: {
    marginTop: 20,
  },
  dangerHelper: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  notFound: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});
