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

  const { categories, habits } = context;

  // Count how many habits each category has. Used to show on the card.
  const habitCountFor = (categoryId: number) =>
    habits.filter((h) => h.categoryId === categoryId).length;

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

        <View style={styles.headerRow}>
          <ScreenHeader
            title="Categories"
            subtitle={`${categories.length} total`}
          />
          <PrimaryButton
            label="+ Add"
            onPress={() => router.push('/category/new')}
            compact
          />
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptyText}>
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
                  pressed ? styles.cardPressed : null,
                ]}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: category.color }]}
                >
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.cardMain}>
                  <Text style={styles.name}>{category.name}</Text>
                  <Text style={styles.meta}>
                    {count} {count === 1 ? 'habit' : 'habits'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
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
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
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
