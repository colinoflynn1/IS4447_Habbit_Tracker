import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import {
  categories as categoriesTable,
  habits as habitsTable,
  habitLogs as habitLogsTable,
  targets as targetsTable,
  users as usersTable,
} from '@/db/schema';
import { logoutUser } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function SettingsScreen() {
  const context = useContext(AppContext);
  const [username, setUsername] = useState<string | null>(null);

  // Look up the current user's username for display.
  useEffect(() => {
    const load = async () => {
      if (!context?.currentUserId) return;
      const all = await db.select().from(usersTable);
      const me = all.find((u) => u.id === context.currentUserId);
      setUsername(me?.username ?? null);
    };
    void load();
  }, [context?.currentUserId]);

  if (!context) return null;
  const { habits, habitLogs, categories, targets, setCurrentUserId } = context;

  const handleLogout = () => {
    logoutUser();
    setCurrentUserId(null);
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete profile?',
      'This will permanently delete your account and all of your habits, logs, categories and targets. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            if (!context.currentUserId) return;
            const userId = context.currentUserId;
            try {
              // Delete child rows first to avoid orphan data.
              await db.delete(habitLogsTable).where(eq(habitLogsTable.userId, userId));
              await db.delete(targetsTable).where(eq(targetsTable.userId, userId));
              await db.delete(habitsTable).where(eq(habitsTable.userId, userId));
              await db.delete(categoriesTable).where(eq(categoriesTable.userId, userId));
              await db.delete(usersTable).where(eq(usersTable.id, userId));
              logoutUser();
              setCurrentUserId(null);
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
        <ScreenHeader title="Settings" subtitle="Account and preferences" />

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileLabel}>Logged in as</Text>
            <Text style={styles.profileName}>{username ?? '—'}</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Manage categories"
          accessibilityRole="button"
          onPress={() => router.push('/categories')}
          style={({ pressed }) => [styles.linkRow, pressed ? styles.linkRowPressed : null]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="pricetags-outline" size={20} color="#0F766E" />
            <Text style={styles.linkLabel}>Manage categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>

        <Pressable
          accessibilityLabel="View history"
          accessibilityRole="button"
          onPress={() => router.push('/history')}
          style={({ pressed }) => [styles.linkRow, pressed ? styles.linkRowPressed : null]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="time-outline" size={20} color="#0F766E" />
            <Text style={styles.linkLabel}>History and search</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>My data</Text>
          <Text style={styles.row}>Categories: {categories.length}</Text>
          <Text style={styles.row}>Habits: {habits.length}</Text>
          <Text style={styles.row}>Logs: {habitLogs.length}</Text>
          <Text style={styles.row}>Targets: {targets.length}</Text>
        </View>

        <View style={styles.dangerZone}>
          <PrimaryButton label="Log out" onPress={handleLogout} variant="secondary" />
        </View>

        <View style={styles.dangerZone}>
          <PrimaryButton
            label="Delete profile"
            onPress={handleDeleteProfile}
            variant="danger"
          />
          <Text style={styles.dangerHelper}>
            Deletes your account and every habit, log, category and target you created.
          </Text>
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
    paddingTop: 10,
  },
  content: {
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 14,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  profileText: {
    flex: 1,
  },
  profileLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  profileName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  linkRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
  },
  linkRowPressed: {
    opacity: 0.7,
  },
  linkLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  linkLabel: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    color: '#334155',
    fontSize: 14,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: 12,
  },
  dangerHelper: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
