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
import { exportLogsToCsv } from '@/lib/export';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function SettingsScreen() {
  const context = useContext(AppContext);
  const [username, setUsername] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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
  const {
    habits,
    habitLogs,
    categories,
    targets,
    setCurrentUserId,
    theme,
    themeName,
    toggleTheme,
  } = context;

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

  const handleExport = async () => {
    setExporting(true);
    const result = await exportLogsToCsv(habitLogs, habits, categories);
    setExporting(false);
    if (!result.ok) {
      Alert.alert('Could not export', result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Settings" subtitle="Account and preferences" />

        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="person-outline" size={20} color={theme.textOnPrimary} />
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileLabel, { color: theme.textMuted }]}>Logged in as</Text>
            <Text style={[styles.profileName, { color: theme.text }]}>{username ?? '—'}</Text>
          </View>
        </View>

        {/* Dark mode toggle */}
        <View style={[styles.linkRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.linkLeft}>
            <Ionicons
              name={themeName === 'dark' ? 'moon' : 'moon-outline'}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.linkLabel, { color: theme.text }]}>Dark mode</Text>
          </View>
          <Switch
            accessibilityLabel="Toggle dark mode"
            value={themeName === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Pressable
          accessibilityLabel="Manage categories"
          accessibilityRole="button"
          onPress={() => router.push('/categories')}
          style={({ pressed }) => [
            styles.linkRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.linkRowPressed : null,
          ]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="pricetags-outline" size={20} color={theme.primary} />
            <Text style={[styles.linkLabel, { color: theme.text }]}>Manage categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </Pressable>

        <Pressable
          accessibilityLabel="View history"
          accessibilityRole="button"
          onPress={() => router.push('/history')}
          style={({ pressed }) => [
            styles.linkRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.linkRowPressed : null,
          ]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={[styles.linkLabel, { color: theme.text }]}>History and search</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </Pressable>

        <Pressable
          accessibilityLabel="Export logs as CSV"
          accessibilityRole="button"
          onPress={handleExport}
          disabled={exporting}
          style={({ pressed }) => [
            styles.linkRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.linkRowPressed : null,
          ]}
        >
          <View style={styles.linkLeft}>
            <Ionicons name="download-outline" size={20} color={theme.primary} />
            <Text style={[styles.linkLabel, { color: theme.text }]}>
              {exporting ? 'Exporting...' : 'Export logs to CSV'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </Pressable>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>My data</Text>
          <Text style={[styles.row, { color: theme.text }]}>Categories: {categories.length}</Text>
          <Text style={[styles.row, { color: theme.text }]}>Habits: {habits.length}</Text>
          <Text style={[styles.row, { color: theme.text }]}>Logs: {habitLogs.length}</Text>
          <Text style={[styles.row, { color: theme.text }]}>Targets: {targets.length}</Text>
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
          <Text style={[styles.dangerHelper, { color: theme.textMuted }]}>
            Deletes your account and every habit, log, category and target you created.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 14,
  },
  avatarCircle: {
    alignItems: 'center',
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
    fontSize: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  linkRow: {
    alignItems: 'center',
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
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    fontSize: 14,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: 12,
  },
  dangerHelper: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
