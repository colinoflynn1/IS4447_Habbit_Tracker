import { db } from './client';
import {
  categories,
  habits,
  habitLogs,
  targets,
  users,
} from './schema';

// Simple salted hash (same approach used in app/_layout for auth).
// Node's crypto is not available in RN, so we keep hashing portable.
// This is a lightweight, deterministic hash intended for a local-only
// educational app — NOT for production authentication.
const seedHash = (password: string): string => {
  let hash = 0;
  const salt = 'habit-tracker-salt';
  const combined = salt + password;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
};

// Build a YYYY-MM-DD date string N days before today.
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export async function seedIfEmpty() {
  // Only seed when the users table is empty — this guarantees idempotency
  // and matches the lab's "early return when rows exist" pattern.
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    return;
  }

  // 1. Demo user
  await db.insert(users).values([
    {
      username: 'demo',
      passwordHash: seedHash('demo123'),
      createdAt: new Date().toISOString(),
    },
  ]);

  const [demoUser] = await db.select().from(users);
  const userId = demoUser.id;

  // 2. Categories — name + colour + icon as required by the brief
  await db.insert(categories).values([
    { userId, name: 'Fitness', color: '#0F766E', icon: 'barbell-outline' },
    { userId, name: 'Health', color: '#2563EB', icon: 'water-outline' },
    { userId, name: 'Learning', color: '#D97706', icon: 'book-outline' },
    { userId, name: 'Mindfulness', color: '#7C3AED', icon: 'leaf-outline' },
  ]);

  const insertedCategories = await db.select().from(categories);
  const catByName = (name: string) =>
    insertedCategories.find((c) => c.name === name)!.id;

  // 3. Habits — mix of boolean (completed/not) and count-based
  await db.insert(habits).values([
    {
      userId,
      categoryId: catByName('Fitness'),
      name: 'Gym session',
      metricType: 'boolean',
      unit: null,
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      categoryId: catByName('Fitness'),
      name: 'Steps',
      metricType: 'count',
      unit: 'steps',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      categoryId: catByName('Health'),
      name: 'Drink water',
      metricType: 'count',
      unit: 'glasses',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      categoryId: catByName('Learning'),
      name: 'Study',
      metricType: 'count',
      unit: 'minutes',
      createdAt: new Date().toISOString(),
    },
    {
      userId,
      categoryId: catByName('Mindfulness'),
      name: 'Meditate',
      metricType: 'boolean',
      unit: null,
      createdAt: new Date().toISOString(),
    },
  ]);

  const insertedHabits = await db.select().from(habits);
  const habitByName = (name: string) =>
    insertedHabits.find((h) => h.name === name)!.id;

  // 4. Habit logs — 30 days of varied data so insights/charts look real
  const logs: {
    userId: number;
    habitId: number;
    date: string;
    value: number;
    notes: string | null;
  }[] = [];

  for (let i = 0; i < 30; i++) {
    const date = daysAgo(i);

    // Gym: 4 sessions per week, skip some days
    if (i % 7 === 0 || i % 7 === 2 || i % 7 === 4 || i % 7 === 6) {
      logs.push({ userId, habitId: habitByName('Gym session'), date, value: 1, notes: null });
    }

    // Steps: between 6k and 12k
    logs.push({
      userId,
      habitId: habitByName('Steps'),
      date,
      value: 6000 + Math.floor(Math.random() * 6000),
      notes: null,
    });

    // Water: 5–9 glasses
    logs.push({
      userId,
      habitId: habitByName('Drink water'),
      date,
      value: 5 + Math.floor(Math.random() * 5),
      notes: null,
    });

    // Study: only weekdays, 20–80 minutes
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      logs.push({
        userId,
        habitId: habitByName('Study'),
        date,
        value: 20 + Math.floor(Math.random() * 60),
        notes: null,
      });
    }

    // Meditate: every other day
    if (i % 2 === 0) {
      logs.push({ userId, habitId: habitByName('Meditate'), date, value: 1, notes: null });
    }
  }

  await db.insert(habitLogs).values(logs);

  // 5. Targets — mix of weekly and monthly, per-habit
  await db.insert(targets).values([
    { userId, habitId: habitByName('Gym session'), categoryId: null, period: 'weekly', amount: 4 },
    { userId, habitId: habitByName('Drink water'), categoryId: null, period: 'weekly', amount: 56 },
    { userId, habitId: habitByName('Study'), categoryId: null, period: 'weekly', amount: 300 },
    { userId, habitId: habitByName('Meditate'), categoryId: null, period: 'monthly', amount: 15 },
    { userId, habitId: habitByName('Steps'), categoryId: null, period: 'weekly', amount: 60000 },
  ]);
}
