// Jest will not let me reference variables defined outside the jest.mock
// factory. Anything I want to share with the test body needs to live on
// globalThis or be prefixed with mock.

jest.mock('@/db/client', () => {
  // I keep an in-memory store on globalThis so the test body can read it.
  const store: Record<string, any[]> = {
    users: [],
    categories: [],
    habits: [],
    habit_logs: [],
    targets: [],
  };
  (globalThis as any).__seedStore = store;

  // Helper to guess the table name from the table object passed by the seed.
  // I cannot reference an outside function so I inline it here.
  const tableNameFor = (table: any): string => {
    if (table?._?.name) return table._.name;
    if (table?.[Symbol.for('drizzle:Name')]) return table[Symbol.for('drizzle:Name')];
    if (table?.name) return table.name;
    const keys = Object.keys(table ?? {});
    if (keys.includes('passwordHash')) return 'users';
    if (keys.includes('color')) return 'categories';
    if (keys.includes('metricType')) return 'habits';
    if (keys.includes('value') && keys.includes('habitId')) return 'habit_logs';
    if (keys.includes('period')) return 'targets';
    return 'unknown';
  };

  return {
    db: {
      select: () => ({
        from: (table: any) => {
          const name = tableNameFor(table);
          return Promise.resolve(store[name] ?? []);
        },
      }),
      insert: (table: any) => {
        const name = tableNameFor(table);
        return {
          values: (rows: any | any[]) => {
            const arr = Array.isArray(rows) ? rows : [rows];
            arr.forEach((row) => {
              store[name].push({
                id: store[name].length + 1,
                ...row,
              });
            });
            return Promise.resolve();
          },
        };
      },
    },
  };
});

import { seedIfEmpty } from '@/db/seed';

describe('seedIfEmpty', () => {
  const getStore = () => (globalThis as any).__seedStore as Record<string, any[]>;

  beforeEach(() => {
    const store = getStore();
    store.users = [];
    store.categories = [];
    store.habits = [];
    store.habit_logs = [];
    store.targets = [];
  });

  it('inserts at least one user, several categories, habits, logs and targets', async () => {
    await seedIfEmpty();
    const store = getStore();

    expect(store.users.length).toBeGreaterThan(0);
    expect(store.categories.length).toBeGreaterThan(0);
    expect(store.habits.length).toBeGreaterThan(0);
    expect(store.habit_logs.length).toBeGreaterThan(0);
    expect(store.targets.length).toBeGreaterThan(0);
  });

  it('does not insert duplicates if called a second time', async () => {
    await seedIfEmpty();
    const store = getStore();
    const userCountAfterFirst = store.users.length;
    const categoryCountAfterFirst = store.categories.length;

    await seedIfEmpty();

    expect(store.users.length).toBe(userCountAfterFirst);
    expect(store.categories.length).toBe(categoryCountAfterFirst);
  });
});
