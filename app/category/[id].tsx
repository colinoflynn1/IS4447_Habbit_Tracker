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
  const { categories, habits, refreshAll, theme } = context;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <Text style={[styles.notFound, { color: theme.textMuted }]}>Category not found.</Text>
          <PrimaryButton label="Back" onPress={() => router.back()} compact />
        </View>
      </SafeAreaView>
    );
  }

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
    // Stop the user from deleting a category that still has habits in it.
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

        <ScreenHeader title="Edit category" subtitle={category.name} />

        <FormField label="Name" value={name} onChangeText={setName} />

        <ColorPicker value={color} onChange={setColor} />

        <IconPicker value={icon} onChange={setIcon} color={color} />

        <View style={[styles.preview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.previewIcon, { backgroundColor: color }]}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <Text style={[styles.previewLabel, { color: theme.text }]}>{name || 'Preview'}</Text>
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
            <Text style={[styles.dangerHelper, { color: theme.textMuted }]}>
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
  preview: {
    alignItems: 'center',
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
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  notFound: {
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});
