import { db } from './client';
import {
  categories,
  habits,
  habitLogs,
  targets,
  users,
} from './schema';

// Small hash function so I am not storing passwords in plain text.
// Node's crypto is not available in React Native so I kept it simple.
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

// Returns a YYYY-MM-DD date string for N days ago.
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export async function seedIfEmpty() {
  // Only seed if the users table is empty. This stops duplicate data
  // every time the app restarts. Same pattern as the students lab.
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

  // 2. Categories with name, colour and icon
  await db.insert(categories).values([
    { userId, name: 'Fitness', color: '#0F766E', icon: 'barbell-outline' },
    { userId, name: 'Health', color: '#2563EB', icon: 'water-outline' },
    { userId, name: 'Learning', color: '#D97706', icon: 'book-outline' },
    { userId, name: 'Mindfulness', color: '#7C3AED', icon: 'leaf-outline' },
  ]);

  const insertedCategories = await db.select().from(categories);
  const catByName = (name: string) =>
    insertedCategories.find((c) => c.name === name)!.id;

  // 3. Habits. Mix of boolean and count so the insights chart has variety.
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

  // 4. Habit logs for the last 30 days so insights and streaks have real data.
  const logs: {
    userId: number;
    habitId: number;
    date: string;
    value: number;
    notes: string | null;
  }[] = [];

  for (let i = 0; i < 30; i++) {
    const date = daysAgo(i);

    // Gym roughly 4 times a week
    if (i % 7 === 0 || i % 7 === 2 || i % 7 === 4 || i % 7 === 6) {
      logs.push({ userId, habitId: habitByName('Gym session'), date, value: 1, notes: null });
    }

    // Steps between 6000 and 12000
    logs.push({
      userId,
      habitId: habitByName('Steps'),
      date,
      value: 6000 + Math.floor(Math.random() * 6000),
      notes: null,
    });

    // Water 5 to 9 glasses
    logs.push({
      userId,
      habitId: habitByName('Drink water'),
      date,
      value: 5 + Math.floor(Math.random() * 5),
      notes: null,
    });

    // Study only on weekdays
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

    // Meditate every other day
    if (i % 2 === 0) {
      logs.push({ userId, habitId: habitByName('Meditate'), date, value: 1, notes: null });
    }
  }

  await db.insert(habitLogs).values(logs);

  // 5. Targets for each habit
  await db.insert(targets).values([
    { userId, habitId: habitByName('Gym session'), categoryId: null, period: 'weekly', amount: 4 },
    { userId, habitId: habitByName('Drink water'), categoryId: null, period: 'weekly', amount: 56 },
    { userId, habitId: habitByName('Study'), categoryId: null, period: 'weekly', amount: 300 },
    { userId, habitId: habitByName('Meditate'), categoryId: null, period: 'monthly', amount: 15 },
    { userId, habitId: habitByName('Steps'), categoryId: null, period: 'weekly', amount: 60000 },
  ]);
}
