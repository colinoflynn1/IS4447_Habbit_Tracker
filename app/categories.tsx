import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function CategoriesScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { categories, habits, theme } = context;

  const habitCountFor = (categoryId: number) =>
    habits.filter((h) => h.categoryId === categoryId).length;

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

        <View style={styles.headerRow}>
          <ScreenHeader title="Categories" subtitle={`${categories.length} total`} />
          <PrimaryButton
            label="+ Add"
            onPress={() => router.push('/category/new')}
            compact
          />
        </View>

        {categories.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="pricetags-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No categories yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Tap Add to create your first category.
            </Text>
          </View>
        ) : (
          categories.map((category) => {
            const count = habitCountFor(category.id);
            return (
              <Pressable
                key={category.id}
                accessibilityLabel={`Edit ${category.name}`}
                accessibilityRole="button"
                onPress={() => router.push(`/category/${category.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: category.color }]}>
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.cardMain}>
                  <Text style={[styles.name, { color: theme.text }]}>{category.name}</Text>
                  <Text style={[styles.meta, { color: theme.textMuted }]}>
                    {count} {count === 1 ? 'habit' : 'habits'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  cardMain: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
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
