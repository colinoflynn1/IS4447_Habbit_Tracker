import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { db } from '@/db/client';
import {
  categories as categoriesTable,
  habits as habitsTable,
  habitLogs as habitLogsTable,
  targets as targetsTable,
  users as usersTable,
} from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';

// Types mirror the Drizzle schema. Defined here so screens can import them
// alongside the context without a circular import.
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
  metricType: string; // 'boolean' | 'count'
  unit: string | null;
  createdAt: string;
};

export type HabitLog = {
  id: number;
  userId: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  value: number;
  notes: string | null;
};

export type Target = {
  id: number;
  userId: number;
  habitId: number | null;
  categoryId: number | null;
  period: string; // 'weekly' | 'monthly'
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
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);

  // Reload every table from the DB. Called on mount and any time a screen
  // mutates data, so the whole app reflects the new state.
  const refreshAll = async () => {
    const [cats, hbs, logs, tgts, usrs] = await Promise.all([
      db.select().from(categoriesTable),
      db.select().from(habitsTable),
      db.select().from(habitLogsTable),
      db.select().from(targetsTable),
      db.select().from(usersTable),
    ]);
    setCategories(cats);
    setHabits(hbs);
    setHabitLogs(logs);
    setTargets(tgts);
    // Auto-login the seeded demo user in Phase 1 so the app is usable
    // before we build the login screens. This is removed in Phase 4.
    if (currentUserId === null && usrs.length > 0) {
      setCurrentUserId(usrs[0].id);
    }
  };

  useEffect(() => {
    const boot = async () => {
      await seedIfEmpty();
      await refreshAll();
    };
    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AppContext.Provider>
  );
}
