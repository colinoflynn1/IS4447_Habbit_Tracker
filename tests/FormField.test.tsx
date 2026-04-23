// Mock expo-sqlite because Jest cannot load native modules.
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => {},
    getFirstSync: () => null,
  }),
}));

// Mock the db client so importing the layout does not try to open SQLite.
jest.mock('@/db/client', () => ({
  db: {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => Promise.resolve() }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: () => ({ where: () => Promise.resolve() }),
  },
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '@/components/ui/form-field';

describe('FormField', () => {
  it('renders the label and fires onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByText, getByLabelText } = render(
      <FormField label="Username" value="" onChangeText={onChangeText} />
    );

    expect(getByText('Username')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Username'), 'colin');
    expect(onChangeText).toHaveBeenCalledWith('colin');
  });

  it('uses the placeholder if I pass one', () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        onChangeText={() => {}}
        placeholder="you@example.com"
      />
    );

    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });
});
