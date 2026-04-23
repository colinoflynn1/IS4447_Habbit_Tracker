import ColorPicker from '@/components/ui/color-picker';
import FormField from '@/components/ui/form-field';
import IconPicker from '@/components/ui/icon-picker';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function NewCategoryScreen() {
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0F766E');
  const [icon, setIcon] = useState('barbell-outline');
  const [saving, setSaving] = useState(false);

  if (!context) return null;
  const { currentUserId, refreshAll, theme } = context;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please give the category a name.');
      return;
    }
    if (!currentUserId) {
      Alert.alert('No user', 'No user is logged in.');
      return;
    }

    setSaving(true);
    try {
      await db.insert(categoriesTable).values({
        userId: currentUserId,
        name: name.trim(),
        color,
        icon,
      });
      await refreshAll();
      router.back();
    } catch (error) {
      Alert.alert('Could not save', 'Something went wrong saving this category.');
      console.error(error);
    } finally {
      setSaving(false);
    }
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

        <ScreenHeader title="New category" subtitle="A group for related habits" />

        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fitness, Sleep, Reading"
        />

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
            label={saving ? 'Saving...' : 'Save category'}
            onPress={handleSave}
          />
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
});
