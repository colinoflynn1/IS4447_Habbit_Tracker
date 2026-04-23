import React from 'react';
import { render } from '@testing-library/react-native';

// Mock expo-sqlite because Jest cannot load native modules.
// I return an object with the methods my code calls so it does not crash.
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => {},
    getFirstSync: () => null,
  }),
}));

// Mock the db client so it does not try to open a real database.
jest.mock('@/db/client', () => ({
  db: {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => Promise.resolve() }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: () => ({ where: () => Promise.resolve() }),
  },
}));

// Mock expo-router because the screen does not need real navigation here.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  Link: ({ children }: any) => children,
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useSegments: () => ['(tabs)'],
  Stack: () => null,
  Tabs: () => null,
  useLocalSearchParams: () => ({}),
}));

// Mock SafeAreaView so it just acts as a passthrough View.
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock Ionicons because it tries to load fonts.
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import HabitsScreen from '@/app/(tabs)/habits';
import { AppContext } from '@/app/_layout';

describe('HabitsScreen integration', () => {
  it('renders a card for every habit that comes through the context', () => {
    // Build a fake context like the one the seed would have produced.
    const fakeContext = {
      currentUserId: 1,
      setCurrentUserId: jest.fn(),
      categories: [
        { id: 1, userId: 1, name: 'Fitness', color: '#0F766E', icon: 'barbell-outline' },
      ],
      setCategories: jest.fn(),
      habits: [
        {
          id: 1,
          userId: 1,
          categoryId: 1,
          name: 'Gym session',
          metricType: 'boolean',
          unit: null,
          createdAt: '2026-04-22T00:00:00.000Z',
        },
        {
          id: 2,
          userId: 1,
          categoryId: 1,
          name: 'Steps',
          metricType: 'count',
          unit: 'steps',
          createdAt: '2026-04-22T00:00:00.000Z',
        },
      ],
      setHabits: jest.fn(),
      habitLogs: [],
      setHabitLogs: jest.fn(),
      targets: [],
      setTargets: jest.fn(),
      refreshAll: jest.fn(),
      booted: true,
    };

    const { getByText } = render(
      <AppContext.Provider value={fakeContext as any}>
        <HabitsScreen />
      </AppContext.Provider>
    );

    expect(getByText('Gym session')).toBeTruthy();
    expect(getByText('Steps')).toBeTruthy();
  });
});
