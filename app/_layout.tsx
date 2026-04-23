import { db } from '@/db/client';
import {
  categories as categoriesTable,
  habits as habitsTable,
  habitLogs as habitLogsTable,
  targets as targetsTable,
  users as usersTable,
} from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { getStoredUserId } from '@/lib/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

export type User = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type Category = {
  id: number;
  userId: number;
  name: string;
  color: string;
  icon: string;
};

export type Habit = {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  metricType: string;
  unit: string | null;
  createdAt: string;
};

export type HabitLog = {
  id: number;
  userId: number;
  habitId: number;
  date: string;
  value: number;
  notes: string | null;
};

export type Target = {
  id: number;
  userId: number;
  habitId: number | null;
  categoryId: number | null;
  period: string;
  amount: number;
};

type AppContextType = {
  currentUserId: number | null;
  setCurrentUserId: React.Dispatch<React.SetStateAction<number | null>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  habitLogs: HabitLog[];
  setHabitLogs: React.Dispatch<React.SetStateAction<HabitLog[]>>;
  targets: Target[];
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
  refreshAll: () => Promise<void>;
  booted: boolean;
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [booted, setBooted] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  // Reload everything from the database. Filter by current user so users only
  // see their own data.
  const refreshAll = async () => {
    const [cats, hbs, logs, tgts] = await Promise.all([
      db.select().from(categoriesTable),
      db.select().from(habitsTable),
      db.select().from(habitLogsTable),
      db.select().from(targetsTable),
    ]);
    setCategories(cats.filter((c) => c.userId === currentUserId));
    setHabits(hbs.filter((h) => h.userId === currentUserId));
    setHabitLogs(logs.filter((l) => l.userId === currentUserId));
    setTargets(tgts.filter((t) => t.userId === currentUserId));
  };

  // Boot once - seed if empty and read stored session.
  useEffect(() => {
    const boot = async () => {
      await seedIfEmpty();
      const storedId = getStoredUserId();
      if (storedId !== null) {
        // Confirm the user still exists before setting it
        const allUsers = await db.select().from(usersTable);
        const exists = allUsers.find((u) => u.id === storedId);
        if (exists) {
          setCurrentUserId(storedId);
        }
      }
      setBooted(true);
    };
    void boot();
  }, []);

  // Whenever currentUserId changes, refresh data.
  useEffect(() => {
    if (currentUserId !== null) {
      void refreshAll();
    } else {
      // No user, clear everything
      setCategories([]);
      setHabits([]);
      setHabitLogs([]);
      setTargets([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Auth gate. If we have booted and there is no user, push the user to the
  // login screen. If we have a user but they are on the login screen, send them
  // to the tabs.
  useEffect(() => {
    if (!booted) return;
    const inAuthGroup = segments[0] === 'auth';
    if (currentUserId === null && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (currentUserId !== null && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [booted, currentUserId, segments, router]);

  return (
    <AppContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        categories,
        setCategories,
        habits,
        setHabits,
        habitLogs,
        setHabitLogs,
        targets,
        setTargets,
        refreshAll,
        booted,
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AppContext.Provider>
  );
}
