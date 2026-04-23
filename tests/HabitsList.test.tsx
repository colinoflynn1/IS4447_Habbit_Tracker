import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => {},
    getFirstSync: () => null,
  }),
}));

jest.mock('@/db/client', () => ({
  db: {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => Promise.resolve() }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: () => ({ where: () => Promise.resolve() }),
  },
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  Link: ({ children }: any) => children,
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useSegments: () => ['(tabs)'],
  Stack: () => null,
  Tabs: () => null,
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import HabitsScreen from '@/app/(tabs)/habits';
import { AppContext } from '@/app/_layout';
import { lightTheme } from '@/lib/theme';

describe('HabitsScreen integration', () => {
  it('renders a card for every habit that comes through the context', () => {
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
      theme: lightTheme,
      themeName: 'light' as const,
      toggleTheme: jest.fn(),
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
